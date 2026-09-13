import { createClient } from '@/lib/supabase/server';
import { isCEFRLevel } from '@/lib/cefr';
import { GRAMMAR_RULES } from '@/lib/grammar-rules';
import {
  scoreRule,
  validateGrammarSubmission,
  validGrammarAnswers,
  practiceMode,
  startingScores,
} from '@/lib/grammar-evidence';

const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user)
      return reply({ error: 'Sign in to load your grammar practice.' }, 401);
    // Fetch the latest evidence for each version independently: repeated work on
    // one rule must not push another rule out of a fixed history window.
    const results = await Promise.all(
      GRAMMAR_RULES.map((rule) =>
        supabase
          .from('grammar_rule_attempts')
          .select(
            'id, rule_id, content_version, answers, writing, self_review, created_at',
          )
          .eq('user_id', auth.user!.id)
          .eq('rule_id', rule.id)
          .eq('content_version', rule.version)
          .order('created_at', { ascending: false })
          .limit(1),
      ),
    );
    if (results.some((result) => result.error))
      return reply(
        {
          error:
            'Saved grammar practice is unavailable. You can still practice here.',
        },
        503,
      );
    const attempts = results
      .flatMap((result) => result.data ?? [])
      .flatMap((row) => {
        const rule = GRAMMAR_RULES.find(
          (item) =>
            item.id === row.rule_id && item.version === row.content_version,
        );
        if (!rule || !validGrammarAnswers(rule, row.answers)) return [];
        return [
          {
            attemptId: row.id,
            ruleId: row.rule_id,
            version: row.content_version,
            savedAt: row.created_at,
            scores: scoreRule(rule, row.answers),
            mode: practiceMode(rule, row.answers),
            checkScores: startingScores(rule, row.answers),
            writing: row.writing,
            selfReview: Array.isArray(row.self_review) ? row.self_review : [],
          },
        ];
      });
    return reply({ attempts });
  } catch {
    return reply(
      { error: 'Saved grammar practice could not be loaded. Try again.' },
      503,
    );
  }
}

export async function POST(request: Request) {
  try {
    // Bound streamed input as well as Content-Length; neither is trusted alone.
    const reader = request.body?.getReader();
    if (!reader) return reply({ error: 'No practice was submitted.' }, 400);
    let bytes = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 24000) {
        await reader.cancel();
        return reply({ error: 'This practice submission is too long.' }, 413);
      }
      chunks.push(value);
    }
    const body = new Uint8Array(bytes);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    let input: unknown;
    try {
      input = JSON.parse(new TextDecoder().decode(body));
    } catch {
      return reply({ error: 'Invalid practice submission.' }, 400);
    }
    const supabase = await createClient();
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user)
      return reply(
        { error: 'Sign in before saving your grammar practice.' },
        401,
      );
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('proficiency_level')
      .eq('id', auth.user.id)
      .single();
    if (profileError)
      return reply(
        { error: 'Your profile could not be loaded. Try again.' },
        503,
      );
    if (!isCEFRLevel(profile?.proficiency_level))
      return reply(
        { error: 'Choose your Spanish level in Profile first.' },
        409,
      );
    const submission = validateGrammarSubmission(
      input,
      profile.proficiency_level,
    );
    if (!submission)
      return reply(
        {
          error:
            'This practice is incomplete, out of date, or outside your current level. Return to the curriculum and reopen the lesson.',
        },
        400,
      );
    const rule = GRAMMAR_RULES.find((item) => item.id === submission.ruleId)!;
    const { error } = await supabase.from('grammar_rule_attempts').insert({
      id: submission.attemptId,
      user_id: auth.user.id,
      rule_id: rule.id,
      content_version: rule.version,
      level: rule.level,
      answers: submission.answers,
      writing: submission.writing,
      self_review: submission.selfReview,
    });
    // A retry reuses the same id; the first immutable submission wins.
    if (error && error.code !== '23505')
      return reply(
        {
          error:
            'Your practice has not been saved. Keep this page open and try saving again.',
        },
        503,
      );
    const { data: stored, error: readError } = await supabase
      .from('grammar_rule_attempts')
      .select(
        'id, rule_id, content_version, answers, writing, self_review, created_at',
      )
      .eq('id', submission.attemptId)
      .eq('user_id', auth.user.id)
      .single();
    if (
      readError ||
      !stored ||
      stored.rule_id !== rule.id ||
      stored.content_version !== rule.version
    )
      return reply(
        {
          error:
            'Saving could not be confirmed. Keep this page open and retry.',
        },
        503,
      );
    return reply({
      attempt: {
        attemptId: stored.id,
        ruleId: stored.rule_id,
        version: stored.content_version,
        savedAt: stored.created_at,
        scores: scoreRule(rule, stored.answers),
        mode: practiceMode(rule, stored.answers),
        checkScores: startingScores(rule, stored.answers),
        writing: stored.writing,
        selfReview: stored.self_review,
      },
    });
  } catch {
    return reply(
      {
        error:
          'Your practice could not be saved. Keep this page open and retry.',
      },
      503,
    );
  }
}
