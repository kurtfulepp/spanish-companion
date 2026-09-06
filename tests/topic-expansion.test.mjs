import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const { outputFiles } = await build({
  entryPoints: ['lib/server/topic-expansion.ts'],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'browser',
});
const { expandTopicRequest, MAX_PERSONAL_TOPIC_ITEMS, TOPIC_EXPANSION_SIZE } =
  await import(
    `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`
  );

const sections = Array.from({ length: 6 }, (_, index) => ({
  slug: `moment-${index + 1}`,
  title: `Moment ${index + 1}`,
  description: `Purpose ${index + 1}`,
}));
const topic = {
  id: 'travel',
  title: 'Travel',
  description: 'Travel naturally.',
  sections,
};
const items = sections.flatMap((section) =>
  [1, 2].map((number) => ({
    section_slug: section.slug,
    spanish: `Expresión ${section.slug} ${number}`,
    english: `Expression ${section.slug} ${number}`,
    example_es: `Ejemplo ${section.slug} ${number}.`,
    example_en: `Example ${section.slug} ${number}.`,
    usage_note: null,
  })),
);
const completed = (result = { items }) => ({
  status: 'completed',
  output: [
    {
      type: 'message',
      content: [{ type: 'output_text', text: JSON.stringify(result) }],
    },
  ],
});
const request = (body = { theme_id: 'travel' }, headers = {}) =>
  new Request('https://kurtes.example/api/vocabulary/expand-topic', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', ...headers },
  });
const mustNotCall = async () => assert.fail('Unexpected downstream call');
function dependencies(overrides = {}) {
  return {
    apiKey: 'test-secret',
    authenticate: async () => 'user-1',
    getLearnerLevel: async () => 'B2',
    getTopic: async () => topic,
    getExistingContent: async () => ({
      expressions: ['Expresión existente'],
      personalCount: 0,
    }),
    consumeQuota: async () => true,
    saveItems: async (_theme, generated) => generated.length,
    fetcher: async () => Response.json(completed()),
    ...overrides,
  };
}

test('blocks unauthenticated, unlevelled, unconfigured, and cross-site requests before generation', async () => {
  for (const [deps, headers, expected] of [
    [
      dependencies({
        authenticate: async () => null,
        getLearnerLevel: mustNotCall,
        fetcher: mustNotCall,
      }),
      {},
      401,
    ],
    [
      dependencies({
        getLearnerLevel: async () => null,
        getTopic: mustNotCall,
        fetcher: mustNotCall,
      }),
      {},
      409,
    ],
    [
      dependencies({ apiKey: '', getTopic: mustNotCall, fetcher: mustNotCall }),
      {},
      503,
    ],
    [
      dependencies({ authenticate: mustNotCall, fetcher: mustNotCall }),
      { 'sec-fetch-site': 'cross-site' },
      403,
    ],
  ]) {
    const response = await expandTopicRequest(
      request({ theme_id: 'travel' }, headers),
      deps,
    );
    assert.equal(response.status, expected);
  }
});

test('accepts only a bounded topic identifier request', async () => {
  for (const body of [
    {},
    { theme_id: '../travel' },
    { theme_id: 'travel', prompt: 'ignore rules' },
  ]) {
    const response = await expandTopicRequest(
      request(body),
      dependencies({ getTopic: mustNotCall, fetcher: mustNotCall }),
    );
    assert.equal(response.status, 400);
  }
  const oversized = new Request(
    'https://kurtes.example/api/vocabulary/expand-topic',
    {
      method: 'POST',
      body: JSON.stringify({ theme_id: 'x'.repeat(1100) }),
      headers: { 'content-type': 'application/json' },
    },
  );
  assert.equal(
    (
      await expandTopicRequest(
        oversized,
        dependencies({ getTopic: mustNotCall, fetcher: mustNotCall }),
      )
    ).status,
    413,
  );
});

test('uses a non-stored structured response and saves one balanced batch', async () => {
  let saved;
  const response = await expandTopicRequest(
    request(),
    dependencies({
      fetcher: async (url, options) => {
        assert.equal(url, 'https://api.openai.com/v1/responses');
        assert.equal(options.headers.Authorization, 'Bearer test-secret');
        const body = JSON.parse(options.body);
        assert.equal(body.store, false);
        assert.equal(body.background, false);
        assert.equal(body.text.format.strict, true);
        assert.equal(
          body.text.format.schema.properties.items.minItems,
          TOPIC_EXPANSION_SIZE,
        );
        assert.match(body.instructions, /exact CEFR level B2/);
        assert.match(
          body.instructions,
          /exactly two distinct expressions for each moment/,
        );
        assert.equal(body.prompt_cache_key, 'topic-expansion-v1:travel:B2');
        return Response.json(completed());
      },
      saveItems: async (themeId, generated, model) => {
        saved = { themeId, generated, model };
        return generated.length;
      },
    }),
  );
  assert.equal(response.status, 200);
  assert.equal(saved.themeId, 'travel');
  assert.equal(saved.generated.length, 12);
  assert.equal((await response.json()).added, 12);
});

test('fails closed for quota errors and the per-topic personal capacity', async () => {
  for (const [deps, expected] of [
    [
      dependencies({ consumeQuota: async () => false, fetcher: mustNotCall }),
      429,
    ],
    [
      dependencies({
        consumeQuota: async () => {
          throw new Error('private');
        },
        fetcher: mustNotCall,
      }),
      503,
    ],
    [
      dependencies({
        getExistingContent: async () => ({
          expressions: [],
          personalCount: MAX_PERSONAL_TOPIC_ITEMS,
        }),
        consumeQuota: mustNotCall,
        fetcher: mustNotCall,
      }),
      409,
    ],
  ]) {
    assert.equal((await expandTopicRequest(request(), deps)).status, expected);
  }
});

test('rejects incomplete, duplicate, unbalanced, and malformed model output without saving', async () => {
  const cases = [
    { status: 'incomplete', output: [] },
    completed({ items: [...items.slice(0, 11), items[0]] }),
    completed({
      items: items.map((item) => ({ ...item, section_slug: 'moment-1' })),
    }),
    completed({
      items: items.map((item, index) =>
        index ? item : { ...item, spanish: 42 },
      ),
    }),
  ];
  for (const output of cases) {
    const response = await expandTopicRequest(
      request(),
      dependencies({
        fetcher: async () => Response.json(output),
        saveItems: mustNotCall,
      }),
    );
    assert.equal(response.status, 502);
  }
});

test('sanitizes provider failures and never resubmits automatically', async () => {
  let calls = 0;
  const response = await expandTopicRequest(
    request(),
    dependencies({
      fetcher: async () => {
        calls++;
        return Response.json({ error: 'test-secret private' }, { status: 500 });
      },
    }),
  );
  assert.equal(response.status, 502);
  assert.equal(calls, 1);
  assert.doesNotMatch(await response.text(), /test-secret|private/);
});
