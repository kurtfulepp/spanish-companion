import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const built = await build({
  stdin: {
    contents: `export { GET, POST } from './app/api/vocabulary/assessment/route'; export * from './lib/vocabulary-assessment'; export * from './lib/server/assessment-crypto'; export * from './lib/server/vocabulary-assessment-data'; export { setClient } from '@/lib/supabase/server'; export { ai } from '@/lib/server/vocabulary-assessment-ai';`,
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
  plugins: [
    {
      name: 'assessment-fixtures',
      setup(builder) {
        builder.onResolve({ filter: /^@\/lib\/supabase\/server$/ }, () => ({
          path: 'client',
          namespace: 'fixture',
        }));
        builder.onResolve(
          { filter: /^@\/lib\/server\/vocabulary-assessment-ai$/ },
          () => ({ path: 'ai', namespace: 'fixture' }),
        );
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({
          contents:
            path === 'client'
              ? `let client; export const setClient = v => {client=v}; export const createClient = async () => client;`
              : `export const ASSESSMENT_MODEL = 'test-model'; export const ai = { calls: 0, recall: 'correct', use: 'correct', fail: false, afterGrade: null, requireFresh: null }; export async function generateUsePrompt(_target,_level,_previous,_key,_model,_signal,requireFresh) { ai.calls++; ai.requireFresh=requireFresh; if(ai.fail) throw new Error('Unavailable'); return {prompt:'You have finished dinner. Ask your server for the bill.',sample:'¿Me trae la cuenta, por favor?',criterion:'Ask for the bill politely.'}; } export async function gradeAssessment() { ai.calls++; if(ai.afterGrade) ai.afterGrade(); if(ai.fail) throw new Error('Unavailable'); return {recall:{verdict:ai.recall,explanation:'Recall feedback.',example:'La cuenta, por favor.'},use:{verdict:ai.use,explanation:'Use feedback.',example:'¿Me trae la cuenta?'}}; }`,
        }));
      },
    },
  ],
});
const mod = await import(
  `data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString('base64')}`
);
const {
  GET,
  POST,
  setClient,
  ai,
  assessmentStatus,
  openChallenge,
  sealChallenge,
  signEvidence,
  verifyEvidence,
  decodeReceipt,
  loadAssessmentResults,
  contentKey,
  makeAssessmentCatalog,
} = mod;
const secret = 'test-only-assessment-secret-not-a-real-key-1234';
const owner = '00000000-0000-4000-8000-000000000001';
const itemId = '00000000-0000-4000-8000-000000000002';
const listId = '00000000-0000-4000-8000-000000000003';
const target = {
  id: itemId,
  english: 'The bill, please.',
  spanish: 'La cuenta, por favor.',
  example_es: 'La cuenta, por favor.',
  example_en: 'The bill, please.',
  usage_note: null,
  cefr_level: 'B2',
};
const request = (body) =>
  new Request('http://localhost/api/vocabulary/assessment', {
    method: 'POST',
    headers: { origin: 'http://localhost' },
    body: JSON.stringify(body),
  });
const correct = (token) => ({
  action: 'submit',
  token,
  answer: '¿Me trae la cuenta, por favor?',
  assisted: false,
});
function setup(options = {}) {
  process.env.OPENAI_API_KEY = 'test-key';
  process.env.VOCABULARY_ASSESSMENT_SECRET = secret;
  Object.assign(ai, {
    calls: 0,
    recall: 'correct',
    use: 'correct',
    fail: false,
    afterGrade: null,
    requireFresh: null,
  });
  const state = {
    rows: [],
    level: 'B2',
    signedIn: true,
    saveError: false,
    readError: false,
    quota: true,
    item: { ...target },
    queries: [],
    ...options,
  };
  setClient({
    auth: {
      getUser: async () => ({
        data: { user: state.signedIn ? { id: owner } : null },
        error: null,
      }),
    },
    rpc: async () => ({ data: state.quota, error: null }),
    from(table) {
      const filters = [];
      let start = 0,
        end = 999,
        insert,
        update;
      const query = {
        select() {
          return query;
        },
        eq(k, v) {
          filters.push([k, v]);
          return query;
        },
        is(k, v) {
          filters.push([k, v]);
          return query;
        },
        order() {
          return query;
        },
        range(a, b) {
          start = a;
          end = b;
          return query;
        },
        maybeSingle() {
          return query;
        },
        insert(value) {
          insert = value;
          return query;
        },
        update(value) {
          update = value;
          return query;
        },
        // oxlint-disable-next-line unicorn/no-thenable -- Supabase query fixture.
        then(resolve) {
          state.queries.push({ table, filters, start });
          let data,
            error = null;
          if (table === 'profiles') data = { proficiency_level: state.level };
          else if (table === 'vocabulary_themes')
            data = {
              id: 'dining-out',
              title: 'Dining Out',
              vocabulary_sections: [
                {
                  title: 'Paying',
                  description: 'Pay for a meal.',
                  sort_order: 1,
                  vocabulary_items: [state.item],
                },
              ],
            };
          else if (table === 'custom_vocabulary_lists')
            data = filters.some(([k, v]) => k === 'id' && v === listId)
              ? {
                  id: listId,
                  name: 'My words',
                  source: state.demo ? 'demo' : 'photo',
                  words: [{ english: 'The bill', spanish: 'La cuenta' }],
                }
              : null;
          else if (table === 'vocabulary_assessment_attempts') {
            if (insert) {
              if (state.saveError) error = { code: 'fail' };
              else if (state.rows.some((row) => row.id === insert.id))
                error = { code: '23505' };
              else state.rows.push({ ...insert, disputed: false });
            }
            if (update)
              for (const row of state.rows)
                if (filters.every(([k, v]) => row[k] === v))
                  row.disputed = update.disputed;
            if (state.readError) error = { code: 'fail' };
            data = state.rows
              .filter((row) => filters.every(([k, v]) => row[k] === v))
              .slice(start, end + 1);
          }
          return Promise.resolve({ data, error }).then(resolve);
        },
      };
      return query;
    },
  });
  return state;
}
async function start(scope = { themeId: 'dining-out', targetId: itemId }) {
  const response = await POST(request({ action: 'start', ...scope }));
  assert.equal(
    response.status,
    200,
    JSON.stringify(await response.clone().json()),
  );
  return (await response.json()).challenge;
}

test('binary decisions preserve uncertainty and never equate lack of evidence with failure', () => {
  assert.equal(assessmentStatus('correct', 'correct'), 'known');
  assert.equal(assessmentStatus('correct_with_fix', 'correct'), 'known');
  assert.equal(
    assessmentStatus('correct_with_fix', 'correct_with_fix'),
    'known',
  );
  assert.equal(assessmentStatus('uncertain', 'correct'), 'not_assessed');
  assert.equal(assessmentStatus('incorrect', 'uncertain'), 'needs_practice');
});
test('signed receipts and encrypted challenges reject changes and cross-account replay', () => {
  const payload = '{"sample":"only a fixture"}';
  const signature = signEvidence(payload, secret);
  assert.equal(verifyEvidence(payload, signature, secret), true);
  assert.equal(verifyEvidence(payload + ' ', signature, secret), false);
  assert.equal(verifyEvidence(payload, 'forged', secret), false);
  const token = sealChallenge({ answer: 'hidden sample' }, secret);
  assert.equal(
    Buffer.from(token, 'base64url').includes(Buffer.from('hidden sample')),
    false,
  );
  assert.deepEqual(openChallenge(token, secret), { answer: 'hidden sample' });
  assert.throws(() => openChallenge(token, secret + 'wrong'));
});
test('anonymous and cross-site requests are rejected without AI usage', async () => {
  setup({ signedIn: false });
  assert.equal((await POST(request({ action: 'start' }))).status, 401);
  setup();
  assert.equal(
    (
      await POST(
        new Request('http://localhost/api/vocabulary/assessment', {
          method: 'POST',
          headers: { origin: 'http://evil.test' },
          body: '{}',
        }),
      )
    ).status,
    403,
  );
  assert.equal(ai.calls, 0);
});
test('missing level, foreign lists, demo lists and oversized submissions cannot produce grades', async () => {
  setup({ level: '' });
  assert.equal(
    (
      await GET(
        new Request(
          'http://localhost/api/vocabulary/assessment?themeId=dining-out',
        ),
      )
    ).status,
    409,
  );
  setup();
  assert.notEqual(
    (
      await POST(
        request({
          action: 'start',
          listId: '00000000-0000-4000-8000-000000000004',
          targetId: '0',
        }),
      )
    ).status,
    200,
  );
  setup({ demo: true });
  assert.notEqual(
    (await POST(request({ action: 'start', listId, targetId: '0' }))).status,
    200,
  );
  setup();
  assert.equal((await POST(request({ large: 'x'.repeat(25000) }))).status, 413);
  assert.equal(ai.calls, 0);
});
test('new and legacy-rated vocabulary start unassessed; invalid receipts are ignored', async () => {
  const state = setup();
  state.rows.push({
    id: 'forged',
    user_id: owner,
    payload: '{}',
    signature: '0'.repeat(64),
    disputed: false,
  });
  const result = await (
    await GET(
      new Request(
        'http://localhost/api/vocabulary/assessment?themeId=dining-out',
      ),
    )
  ).json();
  assert.equal(result.items[0].status, 'not_assessed');
  assert.equal(result.items[0].latest, null);
});
test('one correct contextual response saves a verified result; retry keeps the first result without another AI call', async () => {
  const state = setup();
  const challenge = await start();
  const response = await POST(request(correct(challenge.token)));
  assert.equal(response.status, 200);
  const result = (await response.json()).result;
  assert.equal(result.status, 'known');
  assert.equal(result.retained, false);
  assert.equal(state.rows.length, 1);
  assert.equal(decodeReceipt(state.rows[0], owner, secret).id, result.id);
  assert.equal(decodeReceipt(state.rows[0], 'another-owner', secret), null);
  const calls = ai.calls;
  ai.recall = 'incorrect';
  const retried = await (
    await POST(request({ ...correct(challenge.token), answer: 'changed' }))
  ).json();
  assert.equal(retried.result.status, 'known');
  assert.equal(ai.calls, calls);
  assert.equal(
    state.queries
      .filter((q) => q.table === 'vocabulary_assessment_attempts')
      .every(
        (q) =>
          q.filters.some(([k, v]) => k === 'user_id' && v === owner) ||
          q.filters.length === 0,
      ),
    true,
  );
});
test('small fixes, incorrect, uncertain, skipped and assisted answers have distinct outcomes', async () => {
  for (const [verdict, expected] of [
    ['correct_with_fix', 'known'],
    ['incorrect', 'needs_practice'],
    ['uncertain', 'not_assessed'],
  ]) {
    setup();
    const challenge = await start();
    ai.recall = verdict;
    const result = await (await POST(request(correct(challenge.token)))).json();
    assert.equal(result.result.status, expected);
  }
  setup();
  let challenge = await start();
  const result = await (
    await POST(request({ ...correct(challenge.token), answer: '' }))
  ).json();
  assert.equal(result.result.status, 'needs_practice');

  setup();
  challenge = await start({
    themeId: 'dining-out',
    targetId: itemId,
    assisted: true,
  });
  const practice = await (
    await POST(request({ ...correct(challenge.token), assisted: true }))
  ).json();
  assert.equal(practice.result.status, 'not_assessed');
  assert.equal(practice.result.mode, 'practice');
});
test('assisted practice starts without AI prompt generation and cannot become independent evidence', async () => {
  setup();
  const challenge = await start({
    themeId: 'dining-out',
    targetId: itemId,
    assisted: true,
  });
  assert.equal(ai.calls, 0);
  assert.equal(challenge.mode, 'practice');
  assert.equal(challenge.usePrompt, '');
  assert.equal(openChallenge(challenge.token, secret).assisted, true);
  const result = await (
    await POST(request({ ...correct(challenge.token), assisted: false }))
  ).json();
  assert.equal(result.result.status, 'not_assessed');
  assert.equal(result.result.mode, 'practice');
  assert.equal(ai.calls, 1);
});
test('challenge cannot be used after profile/content changes, expiry or account substitution', async () => {
  for (const change of ['level', 'content', 'expiry', 'owner', 'tamper']) {
    const state = setup();
    let challenge = await start();
    if (change === 'level') state.level = 'A1';
    if (change === 'content') state.item.spanish = 'Otra cosa';
    if (change === 'expiry' || change === 'owner') {
      const value = openChallenge(challenge.token, secret);
      if (change === 'expiry') value.expires = 0;
      else value.userId = 'other';
      challenge = { ...challenge, token: sealChallenge(value, secret) };
    }
    if (change === 'tamper')
      challenge = {
        ...challenge,
        token: challenge.token.slice(0, -10) + 'tampered',
      };
    assert.notEqual(
      (await POST(request(correct(challenge.token)))).status,
      200,
    );
    assert.equal(state.rows.length, 0);
    assert.equal(ai.calls, 1);
  }
});
test('a profile change while grading prevents saving out-of-level evidence', async () => {
  const state = setup();
  const challenge = await start();
  ai.afterGrade = () => {
    state.level = 'A1';
  };
  assert.equal((await POST(request(correct(challenge.token)))).status, 409);
  assert.equal(state.rows.length, 0);
});
test('service, quota and save failures never claim success; typed response can be retried', async () => {
  const state = setup();
  const challenge = await start();
  state.saveError = true;
  assert.equal((await POST(request(correct(challenge.token)))).status, 503);
  assert.equal(state.rows.length, 0);
  state.saveError = false;
  assert.equal((await POST(request(correct(challenge.token)))).status, 200);
  setup({ quota: false });
  assert.equal(
    (
      await POST(
        request({ action: 'start', themeId: 'dining-out', targetId: itemId }),
      )
    ).status,
    429,
  );
  assert.equal(ai.calls, 0);
  setup();
  delete process.env.OPENAI_API_KEY;
  assert.equal(
    (
      await POST(
        request({ action: 'start', themeId: 'dining-out', targetId: itemId }),
      )
    ).status,
    503,
  );
  setup();
  ai.fail = true;
  assert.equal(
    (
      await POST(
        request({ action: 'start', themeId: 'dining-out', targetId: itemId }),
      )
    ).status,
    503,
  );
});
test('challenged results are excluded, including after a fresh account read', async () => {
  const state = setup();
  const challenge = await start();
  const saved = await (await POST(request(correct(challenge.token)))).json();
  const disputed = await (
    await POST(request({ action: 'dispute', id: saved.result.id }))
  ).json();
  assert.equal(disputed.result.status, 'not_assessed');
  const result = await (
    await GET(
      new Request(
        'http://localhost/api/vocabulary/assessment?themeId=dining-out',
      ),
    )
  ).json();
  assert.equal(result.items[0].status, 'not_assessed');
  assert.equal(state.rows[0].disputed, true);
});
test('evidence reads paginate and retain profile/content identity', async () => {
  const state = setup();
  for (let n = 0; n < 1001; n++)
    state.rows.push({
      id: String(n),
      user_id: owner,
      payload: '{}',
      signature: '0'.repeat(64),
      disputed: false,
    });
  assert.deepEqual(
    await loadAssessmentResults(
      {
        from: () => ({
          select() {
            return this;
          },
          eq() {
            return this;
          },
          order() {
            return this;
          },
          range(a, b) {
            return Promise.resolve({
              data: state.rows.slice(a, b + 1),
              error: null,
            });
          },
        }),
      },
      owner,
      secret,
    ),
    [],
  );
  const key = contentKey('topic:item', ['el libro', 'book']);
  assert.notEqual(key, contentKey('topic:item', ['la cuenta', 'bill']));
  const catalog = makeAssessmentCatalog(
    'Test',
    [{ id: 'item', key, english: 'book', spanish: 'el libro' }],
    [{ targetKey: key, level: 'B2', status: 'known' }],
    'A1',
    true,
  );
  assert.equal(catalog.items[0].status, 'not_assessed');
});

test('delayed success requires at least a day and a different contextual prompt', async () => {
  for (const [age, samePrompt, expected] of [
    [1000, false, false],
    [2 * 86400000, true, false],
    [2 * 86400000, false, true],
  ]) {
    const state = setup();
    const challenge = await start();
    const value = openChallenge(challenge.token, secret);
    const previous = {
      id: '00000000-0000-4000-8000-000000000009',
      targetKey: value.targetKey,
      level: 'B2',
      status: 'known',
      savedAt: new Date(Date.now() - age).toISOString(),
      usePrompt: samePrompt
        ? value.usePrompt
        : 'An earlier, different situation.',
      retained: false,
      disputed: false,
    };
    const payload = JSON.stringify({
      version: 1,
      userId: owner,
      result: previous,
      model: 'test-model',
    });
    state.rows.push({
      id: previous.id,
      user_id: owner,
      payload,
      signature: signEvidence(payload, secret),
      disputed: false,
    });
    const response = await POST(request(correct(challenge.token)));
    assert.equal(response.status, 200);
    const result = (await response.json()).result;
    assert.equal(result.retained, expected);
    assert.equal(
      Date.parse(result.reviewAt) - Date.parse(result.savedAt),
      (expected ? 7 : 1) * 86400000,
    );
  }
});
