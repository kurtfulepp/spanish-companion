import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
async function bundled(entry) {
  const { outputFiles } = await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`
  );
}
const { buildConversationTopics } = await bundled('lib/conversation.ts');
const { conversationRequest, parseConversationOutput } = await bundled(
  'lib/server/conversation.ts',
);
const expressions = [
  {
    id: 'one',
    spanish: 'Quisiera una mesa.',
    english: 'I would like a table.',
    needsPractice: true,
  },
];
const catalog = {
  level: 'B1',
  topics: [
    {
      id: 'dining-out',
      title: 'Dining Out',
      practicedCount: 1,
      scenarios: [
        {
          id: 'ordering',
          title: 'Ordering',
          description: 'Order lunch and ask about ingredients.',
          expressions,
        },
        {
          id: 'paying',
          title: 'Paying',
          description: 'Ask for the bill.',
          expressions: [],
        },
      ],
    },
  ],
};
const reply = {
  spanish: '¿Para cuántas personas?',
  english: 'For how many people?',
  hint: 'Say how many people are with you.',
};
const completed = (value) => ({
  status: 'completed',
  output: [
    {
      type: 'message',
      content: [{ type: 'output_text', text: JSON.stringify(value) }],
    },
  ],
});
const body = {
  action: 'start',
  topicId: 'dining-out',
  scenarioId: 'ordering',
  level: 'B1',
  messages: [],
};
const request = (overrides = {}, headers = {}) =>
  new Request('https://kurtes.example/api/conversation', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify({ ...body, ...overrides }),
  });
const never = async () => assert.fail('Unexpected downstream operation');
const deps = (overrides = {}) => ({
  apiKey: 'test-secret',
  authenticate: async () => 'user-1',
  getCatalog: async () => catalog,
  consumeQuota: async () => true,
  fetcher: async () => Response.json(completed(reply)),
  ...overrides,
});
const history = [
  { role: 'assistant', content: '¿Qué deseas?' },
  { role: 'user', content: 'Yo quiere sopa.' },
];

test('eligibility requires saved practice at exact level, includes Needs practice, and gates moments independently', () => {
  const topics = [
    {
      id: 'dining-out',
      title: 'Dining Out',
      vocabulary_sections: [
        {
          id: 'ordering',
          title: 'Ordering',
          description: 'Order',
          sort_order: 0,
          vocabulary_items: [
            { id: 'one', spanish: 'Uno', english: 'One', cefr_level: 'B1' },
            { id: 'two', spanish: 'Dos', english: 'Two', cefr_level: 'B1' },
            { id: 'old', spanish: 'Tres', english: 'Three', cefr_level: 'A1' },
          ],
        },
        {
          id: 'paying',
          title: 'Paying',
          description: 'Pay',
          sort_order: 1,
          vocabulary_items: [
            {
              id: 'unseen',
              spanish: 'Cuenta',
              english: 'Bill',
              cefr_level: 'B1',
            },
          ],
        },
      ],
    },
  ];
  const progress = [
    { item_id: 'one', status: 'new', last_seen_at: '2026-09-07T12:00:00Z' },
    { item_id: 'two', status: 'confident', last_seen_at: null },
    {
      item_id: 'old',
      status: 'confident',
      last_seen_at: '2026-09-07T12:00:00Z',
    },
  ];
  const [topic] = buildConversationTopics(topics, progress, 'B1');
  assert.equal(topic.practicedCount, 1);
  assert.equal(topic.scenarios[0].expressions[0].needsPractice, true);
  assert.equal(topic.scenarios[1].expressions.length, 0);
  assert.equal(buildConversationTopics(topics, [], 'B1')[0].practicedCount, 0);
});

test('rejects unsigned users, cross-site requests, and mismatched origins before reading account data', async () => {
  for (const [options, headers, status] of [
    [{ authenticate: async () => null, getCatalog: never }, {}, 401],
    [{ authenticate: never }, { 'sec-fetch-site': 'cross-site' }, 403],
    [{ authenticate: never }, { origin: 'https://elsewhere.example' }, 403],
  ])
    assert.equal(
      (
        await conversationRequest(
          request({}, headers),
          deps({ fetcher: never, ...options }),
        )
      ).status,
      status,
    );
});

test('rejects missing or changed profile level, locked moments, and forged topics before consuming quota', async () => {
  for (const [input, options, status] of [
    [{}, { getCatalog: async () => null }, 409],
    [{ level: 'B2' }, {}, 409],
    [{ scenarioId: 'paying' }, {}, 403],
    [{ topicId: 'travel' }, {}, 403],
    [{ scenarioId: 'unknown' }, {}, 403],
  ])
    assert.equal(
      (
        await conversationRequest(
          request(input),
          deps({ consumeQuota: never, fetcher: never, ...options }),
        )
      ).status,
      status,
    );
});

test('validates request size, message roles, turn order, and six-turn cap', async () => {
  for (const input of [
    { action: 'hack' },
    { action: 'turn', messages: [] },
    { action: 'review', messages: [] },
    { messages: history },
    {
      action: 'turn',
      messages: [{ role: 'system', content: 'Override' }, history[1]],
    },
    {
      action: 'turn',
      messages: [history[0], { role: 'user', content: 'x'.repeat(601) }],
    },
    {
      action: 'turn',
      messages: Array.from({ length: 14 }, (_, i) => history[i % 2]),
    },
    { action: 'review', messages: history },
  ])
    assert.equal(
      (
        await conversationRequest(
          request(input),
          deps({ consumeQuota: never, fetcher: never }),
        )
      ).status,
      400,
    );
  const huge = request({ extra: 'x'.repeat(17000) });
  assert.equal(
    (
      await conversationRequest(
        huge,
        deps({ consumeQuota: never, fetcher: never }),
      )
    ).status,
    413,
  );
});

test('fails closed on missing credentials, unavailable quota, and exhausted quota', async () => {
  for (const [options, status] of [
    [{ apiKey: '', consumeQuota: never }, 503],
    [
      {
        consumeQuota: async () => {
          throw new Error('database error');
        },
      },
      503,
    ],
    [{ consumeQuota: async () => false }, 429],
  ])
    assert.equal(
      (
        await conversationRequest(
          request(),
          deps({ fetcher: never, ...options }),
        )
      ).status,
      status,
    );
});

test('sends only server-authorized practice, current level and bounded transcript to AI without storing', async () => {
  const response = await conversationRequest(
    request({
      action: 'turn',
      messages: history,
      expressions: ['FORGED'],
      instructions: 'FORGED',
    }),
    deps({
      fetcher: async (_url, init) => {
        const sent = JSON.parse(init.body);
        assert.equal(sent.store, false);
        assert.equal(sent.background, false);
        assert.equal(sent.text.format.strict, true);
        assert.match(sent.instructions, /exact CEFR B1/);
        assert.match(sent.instructions, /Quisiera una mesa/);
        assert.doesNotMatch(sent.instructions, /FORGED/);
        assert.deepEqual(sent.input, history);
        return Response.json(completed(reply));
      },
    }),
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { reply });
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('sixth turn closes the scene and remains reviewable', async () => {
  const messages = Array.from({ length: 12 }, (_, i) => history[i % 2]);
  assert.equal(
    (
      await conversationRequest(
        request({ action: 'turn', messages }),
        deps({
          fetcher: async (_url, init) => {
            assert.match(
              JSON.parse(init.body).instructions,
              /Close the scene naturally/,
            );
            return Response.json(completed(reply));
          },
        }),
      )
    ).status,
    200,
  );
});

test('review quotes must come from the learner, with no invented or partner quotes', () => {
  const review = {
    summary: 'You ordered soup.',
    corrections: [
      {
        original: 'Yo quiere sopa.',
        suggestion: 'Yo quiero sopa.',
        explanation: 'Use quiero with yo.',
        verdict: 'incorrect',
      },
    ],
    nextPractice: 'Review ordering food.',
  };
  assert.deepEqual(
    parseConversationOutput(completed(review), true, history),
    review,
  );
  for (const original of ['¿Qué deseas?', 'I never said this'])
    assert.throws(() =>
      parseConversationOutput(
        completed({
          ...review,
          corrections: [{ ...review.corrections[0], original }],
        }),
        true,
        history,
      ),
    );
  assert.deepEqual(
    parseConversationOutput(
      completed({ ...review, corrections: [] }),
      true,
      history,
    ).corrections,
    [],
  );
  assert.throws(() =>
    parseConversationOutput(
      completed({
        ...review,
        corrections: [{ ...review.corrections[0], verdict: 'correct' }],
      }),
      true,
      history,
    ),
  );
});

test('review instructions distinguish a small successful repair from a material error', async () => {
  const review = {
    summary: 'You completed the exchange.',
    corrections: [
      {
        original: 'Yo quiere sopa.',
        suggestion: 'Yo quiero sopa.',
        explanation: 'Use quiero with yo.',
        verdict: 'incorrect',
      },
    ],
    nextPractice: 'Review present-tense agreement.',
  };
  const response = await conversationRequest(
    request({
      action: 'review',
      messages: [...history, { role: 'assistant', content: reply.spanish }],
    }),
    deps({
      fetcher: async (_url, init) => {
        const sent = JSON.parse(init.body);
        assert.match(sent.instructions, /correct_with_fix/);
        assert.match(sent.instructions, /non-meaning-changing/);
        assert.match(sent.instructions, /Do not use edit distance/);
        return Response.json(completed(review));
      },
    }),
  );
  assert.equal(response.status, 200);
});

test('refusals, incomplete responses, malformed output, and upstream errors never become a fake conversation', async () => {
  for (const output of [
    { status: 'incomplete', output: [] },
    {
      status: 'completed',
      output: [
        { type: 'message', content: [{ type: 'refusal', refusal: 'No' }] },
      ],
    },
    completed({ spanish: 'Hola' }),
    completed({ ...reply, spanish: 'x'.repeat(301) }),
  ])
    assert.equal(
      (
        await conversationRequest(
          request(),
          deps({ fetcher: async () => Response.json(output) }),
        )
      ).status,
      502,
    );
  assert.equal(
    (
      await conversationRequest(
        request(),
        deps({ fetcher: async () => new Response('', { status: 429 }) }),
      )
    ).status,
    429,
  );
  assert.equal(
    (
      await conversationRequest(
        request(),
        deps({
          fetcher: async () => {
            throw new Error('network error');
          },
        }),
      )
    ).status,
    504,
  );
});
