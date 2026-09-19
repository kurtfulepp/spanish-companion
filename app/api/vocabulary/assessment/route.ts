import { randomUUID } from 'node:crypto';
import { createClient } from '@/lib/supabase/server';
import { isCEFRLevel, type CEFRLevel } from '@/lib/cefr';
import {
  assessmentStatus,
  ASSESSMENT_VERSION,
  DAY_MS,
  type AssessmentScope,
  type AssessmentResult,
} from '@/lib/vocabulary-assessment';
import {
  loadAssessmentTargets,
  loadAssessmentResults,
  makeAssessmentCatalog,
  type AssessmentReceipt,
} from '@/lib/server/vocabulary-assessment-data';
import {
  generateUsePrompt,
  gradeAssessment,
  ASSESSMENT_MODEL,
} from '@/lib/server/vocabulary-assessment-ai';
import {
  openChallenge,
  sealChallenge,
  signEvidence,
} from '@/lib/server/assessment-crypto';

const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
class RequestError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
function scopeOf(value: Record<string, unknown>): AssessmentScope {
  if (
    typeof value.themeId === 'string' &&
    /^[a-z][a-z-]{1,60}$/.test(value.themeId) &&
    !value.listId
  )
    return { themeId: value.themeId };
  if (
    typeof value.listId === 'string' &&
    uuid.test(value.listId) &&
    !value.themeId
  )
    return { listId: value.listId };
  throw new RequestError(
    400,
    'Choose a vocabulary topic or one of your lists.',
  );
}
async function context() {
  const client = await createClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user)
    throw new RequestError(401, 'Sign in to assess your vocabulary.');
  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('proficiency_level')
    .eq('id', data.user.id)
    .maybeSingle();
  if (profileError)
    throw new Error('Your profile could not be loaded. Try again.');
  if (!isCEFRLevel(profile?.proficiency_level))
    throw new RequestError(409, 'Choose your level in Profile first.');
  const secret = process.env.VOCABULARY_ASSESSMENT_SECRET ?? '';
  if (secret.length < 32)
    throw new Error('Assessment storage is not configured yet.');
  return {
    client,
    userId: data.user.id,
    level: profile.proficiency_level,
    secret,
  };
}
async function limitedBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError(400, 'No assessment was submitted.');
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 24000) {
      await reader.cancel();
      throw new RequestError(413, 'This assessment is too long.');
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    const value = JSON.parse(new TextDecoder().decode(bytes));
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new Error();
    return value as Record<string, unknown>;
  } catch {
    throw new RequestError(400, 'The assessment request could not be read.');
  }
}
function failure(error: unknown) {
  return reply(
    {
      error:
        error instanceof Error
          ? error.message
          : 'Your assessment could not be completed. Try again.',
    },
    error instanceof RequestError ? error.status : 503,
  );
}
export async function GET(request: Request) {
  try {
    const { client, userId, level, secret } = await context();
    const scope = scopeOf(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const [{ title, targets }, results] = await Promise.all([
      loadAssessmentTargets(client, userId, level, scope),
      loadAssessmentResults(client, userId, secret),
    ]);
    return reply(
      makeAssessmentCatalog(
        title,
        targets,
        results,
        level,
        !!process.env.OPENAI_API_KEY?.trim(),
      ),
    );
  } catch (error) {
    return failure(error);
  }
}

type Challenge = {
  version: number;
  id: string;
  userId: string;
  level: CEFRLevel;
  scope: AssessmentScope;
  targetId: string;
  targetKey: string;
  assisted: boolean;
  expires: number;
  recallPrompt: string;
  usePrompt: string;
  sample: string;
  criterion: string;
};
export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (
      request.headers.get('sec-fetch-site') === 'cross-site' ||
      (origin && origin !== new URL(request.url).origin)
    )
      throw new RequestError(403, 'Open the assessment in the app.');
    const { client, userId, level, secret } = await context();
    const body = await limitedBody(request);
    const results = await loadAssessmentResults(client, userId, secret);
    if (body.action === 'dispute') {
      const existing = results.find((result) => result.id === body.id);
      if (!existing)
        throw new RequestError(404, 'This assessment is unavailable.');
      const { error } = await client
        .from('vocabulary_assessment_attempts')
        .update({ disputed: true })
        .eq('id', existing.id)
        .eq('user_id', userId);
      if (error)
        throw new Error('Your review request was not saved. Try again.');
      return reply({
        result: { ...existing, disputed: true, status: 'not_assessed' },
      });
    }
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) throw new Error('Answer evaluation is not configured yet.');
    const model =
      process.env.OPENAI_ASSESSMENT_MODEL ||
      process.env.OPENAI_TEXT_MODEL ||
      ASSESSMENT_MODEL;
    async function quota() {
      const { data, error } = await client.rpc('consume_speech_quota', {
        p_character_count: 25,
      });
      if (error)
        throw new Error(
          'The assessment allowance could not be checked. Try again.',
        );
      if (data !== true)
        throw new RequestError(
          429,
          'Your practice allowance is used up for now. Try again later.',
        );
    }
    if (body.action === 'start') {
      if (body.assisted !== undefined && typeof body.assisted !== 'boolean')
        throw new RequestError(400, 'The check type could not be verified.');
      const assisted = body.assisted === true;
      const scope = scopeOf(body);
      const { targets } = await loadAssessmentTargets(
        client,
        userId,
        level,
        scope,
      );
      const target = targets.find((item) => item.id === body.targetId);
      if (!target)
        throw new RequestError(
          404,
          'This expression is unavailable at your current level.',
        );
      await quota();
      const prior = results.filter(
        (result) => result.targetKey === target.key && result.level === level,
      );
      const task = await generateUsePrompt(
        target,
        level,
        prior.map((result) => result.usePrompt),
        apiKey,
        model,
        request.signal,
        !assisted,
      );
      const id = randomUUID();
      const challenge: Challenge = {
        version: ASSESSMENT_VERSION,
        id,
        userId,
        level,
        scope,
        targetId: target.id,
        targetKey: target.key,
        assisted,
        expires: Date.now() + 30 * 60_000,
        recallPrompt: target.english,
        usePrompt: task.prompt,
        sample: task.sample,
        criterion: task.criterion,
      };
      return reply({
        challenge: {
          id,
          token: sealChallenge(challenge, secret),
          recallPrompt: challenge.recallPrompt,
          usePrompt: challenge.usePrompt,
        },
      });
    }
    if (
      body.action !== 'submit' ||
      typeof body.token !== 'string' ||
      body.token.length > 16000
    )
      throw new RequestError(400, 'Start an assessment first.');
    let challenge: Challenge;
    try {
      challenge = openChallenge(body.token, secret) as Challenge;
    } catch {
      throw new RequestError(
        400,
        'This assessment could not be verified. Start a new check.',
      );
    }
    if (
      challenge.version !== ASSESSMENT_VERSION ||
      challenge.userId !== userId ||
      challenge.level !== level
    )
      throw new RequestError(
        409,
        'Your profile changed. Start a check at your current level.',
      );
    const existing = results.find((result) => result.id === challenge.id);
    if (existing) return reply({ result: existing });
    if (challenge.expires < Date.now())
      throw new RequestError(
        409,
        'This check expired. Your typed answers are still here; start a new check when ready.',
      );
    if (
      ![body.recallAnswer, body.useAnswer].every(
        (answer) => typeof answer === 'string' && answer.length <= 800,
      ) ||
      typeof body.assisted !== 'boolean'
    )
      throw new RequestError(
        400,
        'Each answer must be no more than 800 characters.',
      );
    const { targets } = await loadAssessmentTargets(
      client,
      userId,
      level,
      challenge.scope,
    );
    const target = targets.find(
      (item) =>
        item.id === challenge.targetId && item.key === challenge.targetKey,
    );
    if (!target)
      throw new RequestError(
        409,
        'This expression changed or is no longer available. Start a new check.',
      );
    await quota();
    const recallAnswer = (body.recallAnswer as string).trim(),
      useAnswer = (body.useAnswer as string).trim();
    const feedback = await gradeAssessment(
      {
        level,
        target,
        recall: { prompt: challenge.recallPrompt, answer: recallAnswer },
        use: {
          prompt: challenge.usePrompt,
          criterion: challenge.criterion,
          reference: challenge.sample,
          answer: useAnswer,
        },
      },
      apiKey,
      model,
      request.signal,
    );
    // Explicit skips cannot be upgraded by an upstream grading error.
    for (const field of ['recall', 'use'] as const)
      if (!(field === 'recall' ? recallAnswer : useAnswer))
        feedback[field] = {
          verdict: 'incorrect',
          explanation:
            'You selected “I don’t know”. Revisit this expression before another assessment.',
          example: field === 'recall' ? target.spanish : challenge.sample,
        };
    const { data: currentProfile, error: currentProfileError } = await client
      .from('profiles')
      .select('proficiency_level')
      .eq('id', userId)
      .maybeSingle();
    if (currentProfileError || currentProfile?.proficiency_level !== level)
      throw new RequestError(
        409,
        'Your level changed during the check. Start a check at your current level.',
      );
    const assisted = challenge.assisted === true || body.assisted;
    const status = assisted
      ? 'not_assessed'
      : assessmentStatus(feedback.recall.verdict, feedback.use.verdict);
    const now = Date.now();
    const prior = results.find(
      (result) => result.targetKey === target.key && result.level === level,
    );
    const retained =
      status === 'known' &&
      prior?.status === 'known' &&
      (prior.retained ||
        (now - Date.parse(prior.savedAt) >= DAY_MS &&
          prior.usePrompt !== challenge.usePrompt));
    const result: AssessmentResult = {
      id: challenge.id,
      targetKey: target.key,
      level,
      savedAt: new Date(now).toISOString(),
      status,
      ...feedback,
      recallAnswer,
      useAnswer,
      recallPrompt: challenge.recallPrompt,
      usePrompt: challenge.usePrompt,
      disputed: false,
      retained: !!retained,
      reviewAt: new Date(now + (retained ? 7 : 1) * DAY_MS).toISOString(),
    };
    const receipt: AssessmentReceipt = {
      version: ASSESSMENT_VERSION,
      userId,
      result,
      model,
    };
    const payload = JSON.stringify(receipt);
    const { error } = await client
      .from('vocabulary_assessment_attempts')
      .insert({
        id: result.id,
        user_id: userId,
        payload,
        signature: signEvidence(payload, secret),
      });
    if (error && error.code !== '23505')
      throw new Error(
        'Your result was not saved. Keep your answers here and retry.',
      );
    const saved = (await loadAssessmentResults(client, userId, secret)).find(
      (item) => item.id === result.id,
    );
    if (!saved)
      throw new Error(
        'Saving could not be confirmed. Keep your answers here and retry.',
      );
    return reply({ result: saved });
  } catch (error) {
    return failure(error);
  }
}
