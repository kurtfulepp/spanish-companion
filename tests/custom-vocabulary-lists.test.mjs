import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
const { outputFiles } = await build({ entryPoints: ['lib/custom-vocabulary-lists.ts'], bundle: true, write: false, format: 'esm', platform: 'browser' });
const { listRecord, saveCustomList, loadCustomLists, changeCustomList, importBrowserLists } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
const fixture = { id: 'f0000000-0000-4000-8000-000000000001', name: ' Kitchen ', createdAt: '2026-09-05T00:00:00Z', source: 'photo', completed: false, words: [{ english: ' mug ', spanish: ' la taza ', photo: 'private-photo' }], photo: 'private-photo' };
function local(initial) { let value = initial; return { getItem: () => value, removeItem: () => { value = null; }, value: () => value }; }
function fake(rows = [], fail = false) {
  const calls = [];
  const client = { from(table) {
    const call = { table, filters: [] }; calls.push(call);
    const query = {
      upsert(row, options) { call.insert = row; call.options = options; return query; },
      select(fields) { call.fields = fields; return query; },
      update(value) { call.update = value; return query; },
      eq(key, value) { call.filters.push([key, value]); return query; },
      is(key, value) { call.filters.push([key, value]); return query; },
      order() { return query; },
      range(start, end) { call.range = [start, end]; return query; },
      then(resolve, reject) {
        if (call.insert && !fail && !rows.some(row => row.id === call.insert.id && row.user_id === call.insert.user_id)) rows.push(call.insert);
        return Promise.resolve({ error: fail ? { message: 'private diagnostic' } : null, data: call.range ? rows.slice(call.range[0], call.range[1] + 1) : null }).then(resolve, reject);
      },
    }; return query;
  } }; return { client, calls, rows };
}
test('account serialization includes only accepted text, stable ID and owner', () => {
  const row = listRecord('owner-a', fixture);
  assert.deepEqual(row.words, [{ english: 'mug', spanish: 'la taza' }]);
  assert.equal(row.name, 'Kitchen'); assert.equal(row.user_id, 'owner-a');
  assert.ok(!JSON.stringify(row).includes('private-photo'));
});
test('import and save retries never duplicate or overwrite an account completion', async () => {
  const db = fake(); const raw = JSON.stringify([fixture]); const storage = local(raw);
  await importBrowserLists(db.client, storage, 'owner-a');
  assert.equal(storage.value(), null); assert.equal(db.rows.length, 1);
  db.rows[0].completed = true;
  await saveCustomList(db.client, 'owner-a', fixture);
  assert.equal(db.rows.length, 1); assert.equal(db.rows[0].completed, true);
  assert.deepEqual(db.calls[0].options, { onConflict: 'user_id,id', ignoreDuplicates: true });
});
test('failed imports and malformed local data preserve the original browser copy', async () => {
  const raw = JSON.stringify([fixture]); const storage = local(raw);
  await assert.rejects(importBrowserLists(fake([], true).client, storage, 'owner-a'));
  assert.equal(storage.value(), raw);
  const malformed = local('broken'); await assert.rejects(importBrowserLists(fake().client, malformed, 'owner-a'));
  assert.equal(malformed.value(), 'broken');
});
test('concurrent additions are not cleared during import', async () => {
  const raw = JSON.stringify([fixture]); let reads = 0; let removed = false;
  const storage = { getItem: () => ++reads > 2 ? raw + ' ' : raw, removeItem: () => { removed = true; } };
  await importBrowserLists(fake().client, storage, 'owner-a'); assert.equal(removed, false);
});
test('all pages load with owner and deletion filters', async () => {
  const db = fake(Array.from({ length: 205 }, (_, i) => ({ ...listRecord('owner-a', fixture), id: String(i) })));
  const result = await loadCustomLists(db.client, 'owner-a'); assert.equal(result.length, 205); assert.equal(db.calls.length, 3);
  for (const call of db.calls) assert.deepEqual(call.filters, [['user_id', 'owner-a'], ['deleted_at', null]]);
});
test('complete, restore and delete target only this owner and list without resending words', async () => {
  const db = fake();
  for (const action of ['complete', 'restore', 'delete']) await changeCustomList(db.client, 'owner-a', fixture.id, action);
  assert.deepEqual(db.calls[0].update, { completed: true }); assert.deepEqual(db.calls[1].update, { completed: false });
  assert.ok(db.calls[2].update.deleted_at);
  for (const call of db.calls) assert.deepEqual(call.filters, [['user_id', 'owner-a'], ['id', fixture.id], ['deleted_at', null]]);
  await assert.rejects(changeCustomList(fake([], true).client, 'owner-a', fixture.id, 'delete'), /could not be saved/);
});
