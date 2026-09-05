import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
const { outputFiles } = await build({ entryPoints: ['lib/demo-lists.ts'], bundle: true, write: false, format: 'esm', platform: 'browser' });
const { readDemoLists, writeDemoList, changeDemoList, demoListsKey } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
const storage = () => { const entries = new Map(); return { getItem: (key) => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value) }; };
const list = (id = 'kitchen') => ({ id, name: ' My kitchen ', completed: false, createdAt: '2026-09-04', words: [{ english: ' mug ', spanish: ' la taza ', photo: 'private-image' }], photo: 'private-image' });

test('saves only accepted text and isolates browser lists by user', () => {
  const local = storage();
  writeDemoList(local, 'user-a', list());
  assert.deepEqual(readDemoLists(local, 'user-b'), []);
  assert.deepEqual(readDemoLists(local, 'user-a')[0].words, [{ english: 'mug', spanish: 'la taza' }]);
  assert.equal(readDemoLists(local, 'user-a')[0].name, 'My kitchen');
  assert.ok(!local.getItem(demoListsKey('user-a')).includes('photo'));
});
test('retrying the same save does not duplicate; multiple lists are retained', () => {
  const local = storage();
  writeDemoList(local, 'user', list()); writeDemoList(local, 'user', list());
  assert.equal(readDemoLists(local, 'user').length, 1);
  for (let i = 0; i < 40; i++) writeDemoList(local, 'user', list(String(i)));
  assert.equal(readDemoLists(local, 'user').length, 41);
});
test('completion archives without losing words; restore and delete target one list', () => {
  const local = storage();
  writeDemoList(local, 'user', list('one')); writeDemoList(local, 'user', list('two'));
  changeDemoList(local, 'user', 'one', 'complete');
  assert.equal(readDemoLists(local, 'user').find(x => x.id === 'one').completed, true);
  changeDemoList(local, 'user', 'one', 'restore');
  assert.equal(readDemoLists(local, 'user').find(x => x.id === 'one').completed, false);
  changeDemoList(local, 'user', 'two', 'delete');
  assert.equal(readDemoLists(local, 'user')[0].id, 'one');
  assert.equal(readDemoLists(local, 'user')[0].words.length, 1);
});
test('invalid drafts, broken storage, and storage failure never report a successful save', () => {
  const local = storage();
  assert.throws(() => writeDemoList(local, 'user', { ...list(), name: '  ' }));
  assert.throws(() => writeDemoList(local, 'user', { ...list(), words: [] }));
  assert.throws(() => readDemoLists(local, ''));
  local.setItem(demoListsKey('user'), 'broken');
  assert.throws(() => writeDemoList(local, 'user', list()));
  assert.equal(local.getItem(demoListsKey('user')), 'broken');
  assert.throws(() => writeDemoList({ getItem: () => null, setItem: () => { throw new Error('Quota exceeded'); } }, 'user', list()));
});
