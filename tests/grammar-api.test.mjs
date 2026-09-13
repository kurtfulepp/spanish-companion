import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const bundled = await build({
  stdin: {
    contents: `export { GET, POST } from './app/api/grammar/route'; export { setClient } from '@/lib/supabase/server'; export { GRAMMAR_RULES } from './lib/grammar-rules'; export { PAST_PRACTICE } from './lib/grammar-past-content';`,
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
  plugins: [
    {
      name: 'authenticated-client-fixture',
      setup(builder) {
        builder.onResolve({ filter: /^@\/lib\/supabase\/server$/ }, () => ({
          path: 'client',
          namespace: 'fixture',
        }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({
          contents: `let client; export const setClient = (value) => { client = value; }; export const createClient = async () => client;`,
        }));
      },
    },
  ],
});
const { GET, POST, setClient, GRAMMAR_RULES, PAST_PRACTICE } = await import(
  `data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`
);
const owner = '00000000-0000-4000-8000-000000000010';
const rule = GRAMMAR_RULES[0];
const payload = () => ({
  attemptId: '00000000-0000-4000-8000-000000000001',
  ruleId: rule.id,
  version: rule.version,
  answers: Object.fromEntries(
    rule.exercises.map((item) => [item.id, item.answers[0]]),
  ),
  writing: 'La mesa es pequeña.',
  selfReview: [true, false, true],
});
const request = (body) =>
  new Request('http://localhost/api/grammar', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

function setup({ signedIn = true, level = 'A1', unavailable = false } = {}) {
  const rows = new Map();
  const scopes = [];
  setClient({
    auth: {
      getUser: async () => ({
        data: { user: signedIn ? { id: owner } : null },
        error: null,
      }),
    },
    from(table) {
      const filters = [];
      const query = {
        select() {
          return query;
        },
        eq(key, value) {
          filters.push([key, value]);
          return query;
        },
        order() {
          return query;
        },
        limit() {
          return query;
        },
        async insert(row) {
          if (unavailable) return { error: { code: '42P01' } };
          if (rows.has(row.id)) return { error: { code: '23505' } };
          rows.set(row.id, { ...row, created_at: '2026-09-07T12:00:00Z' });
          return { error: null };
        },
        async single() {
          if (table === 'profiles')
            return { data: { proficiency_level: level }, error: null };
          const data = [...rows.values()].find((row) =>
            filters.every(([key, value]) => row[key] === value),
          );
          return { data, error: data ? null : { code: 'PGRST116' } };
        },
        // Supabase query builders intentionally implement PromiseLike.
        // eslint-disable-next-line unicorn/no-thenable
        then(resolve) {
          scopes.push(filters);
          return Promise.resolve({
            data: [...rows.values()].filter((row) =>
              filters.every(([key, value]) => row[key] === value),
            ),
            error: unavailable ? { code: '42P01' } : null,
          }).then(resolve);
        },
      };
      return query;
    },
  });
  return { rows, scopes };
}

test('API denies anonymous reads and writes without touching evidence', async () => {
  const { rows } = setup({ signedIn: false });
  assert.equal((await GET()).status, 401);
  assert.equal((await POST(request(payload()))).status, 401);
  assert.equal(rows.size, 0);
});
test('API saves account-owned evidence, derives scores, and makes retry immutable', async () => {
  const { rows, scopes } = setup();
  const body = payload();
  const first = await POST(
    request({ ...body, userId: 'another-account', score: 999 }),
  );
  assert.equal(first.status, 200);
  assert.equal(first.headers.get('Cache-Control'), 'no-store');
  assert.equal(rows.get(body.attemptId).user_id, owner);
  body.writing = 'An altered retry';
  const retry = await POST(request(body));
  assert.equal(retry.status, 200);
  assert.equal((await retry.json()).attempt.writing, 'La mesa es pequeña.');
  assert.equal(rows.size, 1);
  const response = await GET();
  const result = await response.json();
  assert.equal(result.attempts.length, 1);
  assert.deepEqual(result.attempts[0].scores.formation, {
    correct: 2,
    total: 2,
  });
  assert.equal(scopes.length, GRAMMAR_RULES.length);
  assert.ok(
    scopes.every((filters) =>
      filters.some(([key, value]) => key === 'user_id' && value === owner),
    ),
  );
});
test('API rejects missing profile level, invalid versions, malformed input and oversized streams', async () => {
  setup({ level: null });
  assert.equal((await POST(request(payload()))).status, 409);
  setup();
  assert.equal(
    (await POST(request({ ...payload(), version: 200 }))).status,
    400,
  );
  assert.equal((await POST(request('{'))).status, 400);
  assert.equal((await POST(request('x'.repeat(24001)))).status, 413);
});
test('storage failures never report a saved attempt', async () => {
  const { rows } = setup({ unavailable: true });
  assert.equal((await GET()).status, 503);
  const response = await POST(request(payload()));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).attempt, undefined);
  assert.equal(rows.size, 0);
});

test('API saves and reloads separate check and review evidence without merging score keys', async () => {
  const pathRule = GRAMMAR_RULES.find(
    (item) => item.id === 'B1-02.earlier-past',
  );
  const extra = PAST_PRACTICE[pathRule.id];
  for (const questions of [
    [...pathRule.exercises, ...extra.check],
    extra.revisit,
  ]) {
    setup({ level: 'B1' });
    const body = {
      ...payload(),
      ruleId: pathRule.id,
      version: pathRule.version,
      answers: Object.fromEntries(
        questions.map((item) => [item.id, item.answers[0]]),
      ),
      selfReview: pathRule.production.checklist.map(() => false),
    };
    const response = await POST(request(body));
    assert.equal(response.status, 200);
    const saved = (await response.json()).attempt;
    const loaded = (await (await GET()).json()).attempts[0];
    assert.deepEqual(loaded, saved);
    const isReview = questions === extra.revisit;
    assert.equal(loaded.mode, isReview ? 'revisit' : 'lesson');
    assert.equal(!!loaded.checkScores, !isReview);
    assert.equal(
      Object.values(loaded.scores).reduce((sum, item) => sum + item.total, 0),
      isReview ? 3 : 4,
    );
    setup({ level: 'A2' });
    assert.equal((await POST(request(body))).status, 400);
  }
});
