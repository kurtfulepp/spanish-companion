import { CEFR_GUIDANCE, isCEFRLevel, type CEFRLevel } from '@/lib/cefr';

export const DEFAULT_TOPIC_MODEL = 'gpt-4.1-mini-2025-04-14';
export const TOPIC_PROMPT_VERSION = 'topic-expansion-v1';
export const TOPIC_EXPANSION_SIZE = 12;
export const MAX_PERSONAL_TOPIC_ITEMS = 72;

export type TopicSection = {
  slug: string;
  title: string;
  description: string;
};

export type TopicDefinition = {
  id: string;
  title: string;
  description: string;
  sections: TopicSection[];
};

export type GeneratedTopicItem = {
  section_slug: string;
  spanish: string;
  english: string;
  example_es: string;
  example_en: string;
  usage_note: string | null;
};

type ExistingTopicContent = {
  expressions: string[];
  personalCount: number;
};

type Dependencies = {
  apiKey?: string;
  model?: string;
  authenticate: () => Promise<string | null>;
  getLearnerLevel: (userId: string) => Promise<CEFRLevel | null>;
  getTopic: (themeId: string) => Promise<TopicDefinition | null>;
  getExistingContent: (
    themeId: string,
    userId: string,
  ) => Promise<ExistingTopicContent>;
  consumeQuota: () => Promise<boolean>;
  saveItems: (
    themeId: string,
    items: GeneratedTopicItem[],
    model: string,
  ) => Promise<number>;
  fetcher?: typeof fetch;
};

class TopicExpansionError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validText(value: unknown, max: number): value is string {
  return (
    typeof value === 'string' && value.trim().length > 0 && value.length <= max
  );
}

async function readThemeId(request: Request) {
  const declaredLength = Number(request.headers.get('content-length'));
  if (declaredLength > 1024)
    throw new TopicExpansionError(
      413,
      'request_too_large',
      'The request is too large.',
    );
  const raw = await request.text();
  if (raw.length > 1024)
    throw new TopicExpansionError(
      413,
      'request_too_large',
      'The request is too large.',
    );
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new TopicExpansionError(
      400,
      'invalid_request',
      'Choose a valid vocabulary topic.',
    );
  }
  if (
    !isRecord(value) ||
    Object.keys(value).some((key) => key !== 'theme_id') ||
    typeof value.theme_id !== 'string' ||
    !/^[a-z0-9-]{1,64}$/.test(value.theme_id)
  ) {
    throw new TopicExpansionError(
      400,
      'invalid_request',
      'Choose a valid vocabulary topic.',
    );
  }
  return value.theme_id;
}

function responseText(response: unknown) {
  if (
    !isRecord(response) ||
    response.status !== 'completed' ||
    !Array.isArray(response.output)
  ) {
    throw new TopicExpansionError(
      502,
      'generation_incomplete',
      'New expressions could not be completed. Try again.',
    );
  }
  const content = response.output.flatMap((item: unknown) =>
    isRecord(item) && item.type === 'message' && Array.isArray(item.content)
      ? item.content
      : [],
  );
  if (
    content.some((item: unknown) => isRecord(item) && item.type === 'refusal')
  ) {
    throw new TopicExpansionError(
      422,
      'generation_refused',
      'New expressions could not be generated for this topic.',
    );
  }
  const texts = content.filter(
    (item: unknown) => isRecord(item) && item.type === 'output_text',
  );
  if (texts.length !== 1 || typeof texts[0].text !== 'string') {
    throw new TopicExpansionError(
      502,
      'invalid_generation',
      'New expressions could not be read. Try again.',
    );
  }
  try {
    return JSON.parse(texts[0].text) as unknown;
  } catch {
    throw new TopicExpansionError(
      502,
      'invalid_generation',
      'New expressions could not be read. Try again.',
    );
  }
}

function parseItems(
  response: unknown,
  topic: TopicDefinition,
  existing: string[],
) {
  const result = responseText(response);
  if (
    !isRecord(result) ||
    !Array.isArray(result.items) ||
    result.items.length !== TOPIC_EXPANSION_SIZE
  ) {
    throw new TopicExpansionError(
      502,
      'invalid_generation',
      'New expressions could not be read. Try again.',
    );
  }
  const sectionSlugs = new Set(topic.sections.map((section) => section.slug));
  const counts = new Map<string, number>();
  const seen = new Set(
    existing.map((text) =>
      text.trim().normalize('NFC').toLocaleLowerCase('es'),
    ),
  );
  const items: GeneratedTopicItem[] = [];

  for (const value of result.items) {
    if (
      !isRecord(value) ||
      !validText(value.section_slug, 80) ||
      !sectionSlugs.has(value.section_slug) ||
      !validText(value.spanish, 160) ||
      !validText(value.english, 160) ||
      !validText(value.example_es, 300) ||
      !validText(value.example_en, 300) ||
      !(value.usage_note === null || validText(value.usage_note, 300))
    ) {
      throw new TopicExpansionError(
        502,
        'invalid_generation',
        'New expressions could not be read. Try again.',
      );
    }
    const key = value.spanish.trim().normalize('NFC').toLocaleLowerCase('es');
    if (seen.has(key))
      throw new TopicExpansionError(
        502,
        'duplicate_generation',
        'The generated set repeated existing material. Try again.',
      );
    seen.add(key);
    counts.set(value.section_slug, (counts.get(value.section_slug) ?? 0) + 1);
    items.push({
      section_slug: value.section_slug,
      spanish: value.spanish.trim(),
      english: value.english.trim(),
      example_es: value.example_es.trim(),
      example_en: value.example_en.trim(),
      usage_note: value.usage_note?.trim() ?? null,
    });
  }
  if (topic.sections.some((section) => counts.get(section.slug) !== 2)) {
    throw new TopicExpansionError(
      502,
      'unbalanced_generation',
      'The generated set did not cover every moment. Try again.',
    );
  }
  return items;
}

function schemaFor(topic: TopicDefinition) {
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      items: {
        type: 'array',
        minItems: TOPIC_EXPANSION_SIZE,
        maxItems: TOPIC_EXPANSION_SIZE,
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            section_slug: {
              type: 'string',
              enum: topic.sections.map((section) => section.slug),
            },
            spanish: { type: 'string', minLength: 1, maxLength: 160 },
            english: { type: 'string', minLength: 1, maxLength: 160 },
            example_es: { type: 'string', minLength: 1, maxLength: 300 },
            example_en: { type: 'string', minLength: 1, maxLength: 300 },
            usage_note: { type: ['string', 'null'], maxLength: 300 },
          },
          required: [
            'section_slug',
            'spanish',
            'english',
            'example_es',
            'example_en',
            'usage_note',
          ],
        },
      },
    },
    required: ['items'],
  };
}

function instructions(
  topic: TopicDefinition,
  level: CEFRLevel,
  existing: string[],
) {
  const moments = topic.sections
    .map(
      (section) =>
        `- ${section.slug}: ${section.title} — ${section.description}`,
    )
    .join('\n');
  const avoid = existing
    .slice(0, 80)
    .map((expression) => `- ${expression}`)
    .join('\n');
  return `Create practical spoken Spanish expressions for the KurtES topic “${topic.title}” at exact CEFR level ${level}.
Level guidance: ${CEFR_GUIDANCE[level].vocabulary}
Use natural, broadly understood Latin American Spanish. Prefer language a learner can say in a real interaction, not isolated nouns or literary phrasing.
Create exactly two distinct expressions for each moment below, for exactly ${TOPIC_EXPANSION_SIZE} items total:
${moments}
Keep the expression and translation concise. Give one realistic Spanish example and an accurate English translation. Use a short usage note only for register, grammar, or regional nuance; otherwise null.
Do not repeat or closely paraphrase these existing expressions:
${avoid || '- None yet'}
Do not include unsafe advice, stereotypes, brands, personal data, markdown, or extra fields.`;
}

export async function expandTopicRequest(request: Request, deps: Dependencies) {
  try {
    if (request.headers.get('sec-fetch-site') === 'cross-site') {
      throw new TopicExpansionError(
        403,
        'cross_site_request',
        'Open vocabulary in the app.',
      );
    }
    const userId = await deps.authenticate();
    if (!userId)
      throw new TopicExpansionError(
        401,
        'authentication_required',
        'Sign in to add expressions.',
      );
    const level = await deps.getLearnerLevel(userId);
    if (!isCEFRLevel(level))
      throw new TopicExpansionError(
        409,
        'profile_level_required',
        'Set your Spanish level before adding expressions.',
      );
    if (!deps.apiKey?.trim())
      throw new TopicExpansionError(
        503,
        'generation_not_configured',
        'Topic expansion is not configured yet.',
      );
    const themeId = await readThemeId(request);
    const topic = await deps.getTopic(themeId);
    if (!topic || topic.sections.length !== 6)
      throw new TopicExpansionError(
        404,
        'topic_not_found',
        'That vocabulary topic is not available.',
      );
    const existing = await deps.getExistingContent(themeId, userId);
    if (existing.personalCount >= MAX_PERSONAL_TOPIC_ITEMS) {
      throw new TopicExpansionError(
        409,
        'topic_capacity_reached',
        'You have reached the current expansion limit for this level.',
      );
    }
    let allowed: boolean;
    try {
      allowed = await deps.consumeQuota();
    } catch {
      throw new TopicExpansionError(
        503,
        'quota_unavailable',
        'Topic expansion is temporarily unavailable.',
      );
    }
    if (!allowed)
      throw new TopicExpansionError(
        429,
        'topic_limit_reached',
        'Topic expansion limit reached. Try again later.',
      );
    const model = deps.model?.trim() || DEFAULT_TOPIC_MODEL;
    let upstream: Response;
    try {
      upstream = await (deps.fetcher ?? fetch)(
        'https://api.openai.com/v1/responses',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${deps.apiKey}`,
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.any([
            request.signal,
            AbortSignal.timeout(30_000),
          ]),
          body: JSON.stringify({
            model,
            store: false,
            background: false,
            max_output_tokens: 4000,
            prompt_cache_key: `${TOPIC_PROMPT_VERSION}:${themeId}:${level}`,
            instructions: instructions(topic, level, existing.expressions),
            input: [
              {
                role: 'user',
                content: [
                  {
                    type: 'input_text',
                    text: `Expand ${topic.title} for level ${level}.`,
                  },
                ],
              },
            ],
            text: {
              format: {
                type: 'json_schema',
                name: 'topic_vocabulary',
                strict: true,
                schema: schemaFor(topic),
              },
            },
          }),
        },
      );
    } catch (error) {
      const timedOut =
        error instanceof Error &&
        (error.name === 'TimeoutError' || error.name === 'AbortError');
      throw new TopicExpansionError(
        timedOut ? 504 : 502,
        'generation_unavailable',
        'Topic expansion is unavailable. Try again.',
      );
    }
    if (!upstream.ok) {
      await upstream.body?.cancel();
      throw new TopicExpansionError(
        upstream.status === 429 ? 429 : 502,
        upstream.status === 429
          ? 'generation_limit_reached'
          : 'generation_failed',
        upstream.status === 429
          ? 'AI spending or usage limit reached. Try again later.'
          : 'Topic expansion is unavailable. Try again.',
      );
    }
    const items = parseItems(
      await upstream.json(),
      topic,
      existing.expressions,
    );
    const saved = await deps.saveItems(themeId, items, model);
    if (saved < 1)
      throw new TopicExpansionError(
        409,
        'no_new_expressions',
        'No new expressions were added. Try again.',
      );
    return json({
      added: saved,
      cefr_level: level,
      total_personal: existing.personalCount + saved,
    });
  } catch (error) {
    if (error instanceof TopicExpansionError)
      return json({ error: error.message, code: error.code }, error.status);
    return json(
      {
        error: 'Topic expansion is unavailable. Try again.',
        code: 'topic_expansion_failed',
      },
      502,
    );
  }
}
