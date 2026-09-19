import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const bundled = await build({
  stdin: {
    contents: `export { GET } from './app/api/grammar/contexts/route'; export { setClient } from '@/lib/supabase/server'; export { setLoader } from '@/lib/server/grammar-contexts';`,
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
  plugins: [
    {
      name: 'grammar-context-fixtures',
      setup(builder) {
        builder.onResolve({ filter: /^@\/lib\/supabase\/server$/ }, () => ({
          path: 'client',
          namespace: 'fixture',
        }));
        builder.onResolve(
          { filter: /^@\/lib\/server\/grammar-contexts$/ },
          () => ({ path: 'loader', namespace: 'fixture' }),
        );
        builder.onLoad({ filter: /^client$/, namespace: 'fixture' }, () => ({
          contents: `let client; export const setClient = value => { client = value; }; export const createClient = async () => client;`,
        }));
        builder.onLoad({ filter: /^loader$/, namespace: 'fixture' }, () => ({
          contents: `let loader; export const setLoader = value => { loader = value; }; export const loadGrammarContexts = (...args) => loader(...args);`,
        }));
      },
    },
  ],
});
const { GET, setClient, setLoader } = await import(
  `data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`
);

test('context endpoint denies anonymous access before loading private words', async () => {
  setClient({
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  });
  setLoader(() => {
    throw new Error('Private loader must not run');
  });
  const response = await GET();
  assert.equal(response.status, 401);
});

test('context endpoint scopes loading to the authenticated account', async () => {
  const owner = '00000000-0000-4000-8000-000000000010';
  const client = {
    auth: {
      getUser: async () => ({ data: { user: { id: owner } }, error: null }),
    },
  };
  setClient(client);
  setLoader((receivedClient, receivedOwner) => {
    assert.equal(receivedClient, client);
    assert.equal(receivedOwner, owner);
    return {
      level: 'B2',
      contexts: [
        {
          id: 'custom:list',
          kind: 'custom',
          title: 'My list',
          words: [{ spanish: 'mesa', english: 'table' }],
        },
      ],
    };
  });
  const response = await GET();
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(body.contexts[0].title, 'My list');
});

test('context endpoint reports unavailable data without leaking details', async () => {
  setClient({
    auth: {
      getUser: async () => ({ data: { user: { id: 'owner' } }, error: null }),
    },
  });
  setLoader(() => {
    throw new Error('database detail');
  });
  const response = await GET();
  assert.equal(response.status, 503);
  assert.equal(
    (await response.json()).error.includes('database detail'),
    false,
  );
});
