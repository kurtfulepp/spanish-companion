import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
const built = await build({
  stdin: {
    contents: `export {GET} from './app/api/home/route'; export {assessedArea,practiceAreas} from './lib/home-dashboard'; export {setClient} from '@/lib/supabase/server'; export {fixture} from '@/lib/server/vocabulary-assessment-data'; export {GRAMMAR_RULES} from './lib/grammar-rules';`,
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
  plugins: [
    {
      name: 'home-fixtures',
      setup(builder) {
        builder.onResolve({ filter: /^@\/lib\/supabase\/server$/ }, () => ({
          path: 'client',
          namespace: 'fixture',
        }));
        builder.onResolve(
          { filter: /^@\/lib\/server\/vocabulary-assessment-data$/ },
          () => ({ path: 'assessment', namespace: 'fixture' }),
        );
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({
          contents:
            path === 'client'
              ? `let client;export const setClient=v=>{client=v};export const createClient=async()=>client;`
              : `export const fixture={results:[],fail:false};export const loadAssessmentResults=async()=>{if(fixture.fail)throw new Error('Unavailable');return fixture.results;};export const loadAssessmentTargets=async(_client,_owner,_level,scope)=>({targets:[{key:scope.listId?'list-key':'topic-key'}]});`,
        }));
      },
    },
  ],
});
const { GET, assessedArea, practiceAreas, setClient, fixture, GRAMMAR_RULES } =
  await import(
    `data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString('base64')}`
  );
function setup({
  signedIn = true,
  level = 'B2',
  rows = [],
  lists = [],
  failure,
  seconds = 0,
} = {}) {
  fixture.results = [];
  fixture.fail = false;
  const reads = [];
  setClient({
    rpc: async () => failure === 'practice_time' ? { data: null, error: {} } : { data: seconds, error: null },
    auth: {
      getUser: async () => ({
        data: { user: signedIn ? { id: 'owner' } : null },
        error: null,
      }),
    },
    from(table) {
      let start = 0,
        end = 999;
      const filters = [];
      const q = {
        select() {
          return q;
        },
        eq(k, v) {
          filters.push([k, v]);
          return q;
        },
        is(k, v) {
          filters.push([k, v]);
          return q;
        },
        order() {
          return q;
        },
        maybeSingle() {
          return q;
        },
        range(a, b) {
          start = a;
          end = b;
          return q;
        },
        // oxlint-disable-next-line unicorn/no-thenable -- Supabase query fixture.
        then(resolve) {
          reads.push({ table, start, filters });
          if (table === failure)
            return Promise.resolve({
              data: null,
              error: { message: 'Unavailable' },
            }).then(resolve);
          const data =
            table === 'profiles'
              ? { proficiency_level: level }
              : table === 'vocabulary_themes'
                ? [{ id: 'dining-out', title: 'Dining Out' }]
                : (table === 'grammar_rule_attempts' ? rows : lists).slice(
                    start,
                    end + 1,
                  );
          return Promise.resolve({ data, error: null }).then(resolve);
        },
      };
      return q;
    },
  });
  return reads;
}
test('dashboard requires authentication and disables caching', async () => {
  const reads = setup({ signedIn: false });
  const response = await GET();
  assert.equal(response.status, 401);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(reads.length, 0);
});
test('self-rating counts never become assessed knowledge or practice gaps', async () => {
  setup({
    lists: [
      {
        id: 'mine',
        name: 'My list',
        source: 'photo',
        practiced_count: 5,
        confident_count: 5,
      },
      { id: 'demo', name: 'Demo', source: 'demo' },
    ],
  });
  const result = await (await GET()).json();
  assert.equal(result.lists.length, 1);
  assert.equal(result.lists[0].known, 0);
  assert.equal(result.lists[0].unassessed, 1);
  assert.equal(result.vocabulary[0].known, 0);
  assert.deepEqual(practiceAreas(result), []);
});
test('verified assessed results drive knowledge and gap counts at exact level', async () => {
  setup();
  fixture.results = [
    {
      targetKey: 'topic-key',
      level: 'B2',
      status: 'known',
      disputed: false,
      retained: true,
    },
  ];
  const result = await (await GET()).json();
  assert.equal(result.vocabulary[0].known, 1);
  assert.equal(result.vocabulary[0].retained, 1);
  assert.equal(result.vocabulary[0].unassessed, 0);
});
test('uncertain, challenged, unseen and other-level evidence are outside binary results', () => {
  const area = {
    id: 'x',
    title: 'Test',
    href: '/vocabulary',
    kind: 'Vocabulary',
  };
  const data = assessedArea(
    area,
    ['a', 'b', 'c', 'd', 'e'],
    [
      { targetKey: 'a', level: 'B2', status: 'not_assessed' },
      { targetKey: 'b', level: 'B2', status: 'known', disputed: true },
      { targetKey: 'c', level: 'A1', status: 'known' },
      { targetKey: 'e', level: 'B2', status: 'needs_practice' },
    ],
    'B2',
  );
  assert.equal(data.known, 0);
  assert.equal(data.unassessed, 4);
  assert.equal(data.needsPractice, 1);
  assert.equal(practiceAreas({ vocabulary: [data], lists: [] }).length, 1);
});
test('storage failures show unavailable rather than zero knowledge', async () => {
  setup();
  fixture.fail = true;
  const result = await (await GET()).json();
  assert.equal(result.vocabulary, null);
  assert.equal(result.lists, null);
  assert.ok(result.grammar);
  setup({ failure: 'profiles' });
  assert.equal((await GET()).status, 503);
});
test('practice hours distinguish saved time, zero and unavailable', async () => {
  setup({ seconds: 5400 });
  assert.equal((await (await GET()).json()).practiceSeconds, 5400);
  setup();
  assert.equal((await (await GET()).json()).practiceSeconds, 0);
  setup({ failure: 'practice_time' });
  const summary = await (await GET()).json();
  assert.equal(summary.practiceSeconds, null);
  assert.ok(summary.vocabulary);
});
test('grammar counts preserve level and content-version scope across pages', async () => {
  const rule = GRAMMAR_RULES.find((r) => r.level === 'A1');
  const row = {
    id: '1',
    rule_id: rule.id,
    content_version: rule.version,
    answers: Object.fromEntries(
      rule.exercises.map((e) => [e.id, e.answers[0]]),
    ),
  };
  const reads = setup({
    level: 'A1',
    rows: [
      ...Array.from({ length: 1000 }, () => row),
      { ...row, content_version: 99 },
    ],
  });
  const result = await (await GET()).json();
  assert.equal(result.grammar.practiced, 1);
  assert.ok(
    reads.some((r) => r.table === 'grammar_rule_attempts' && r.start === 1000),
  );
  for (const read of reads.filter((r) => r.table === 'grammar_rule_attempts'))
    assert.ok(read.filters.some(([k, v]) => k === 'user_id' && v === 'owner'));
});
