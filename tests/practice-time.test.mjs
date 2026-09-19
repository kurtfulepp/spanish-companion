import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const built = await build({
  stdin: { contents: `export * from './lib/practice-time'; export {POST} from './app/api/practice-time/route'; export {fixture} from '@/lib/supabase/server';`, resolveDir: process.cwd() },
  bundle: true, write: false, platform: 'node', format: 'esm',
  plugins: [{ name: 'client', setup(builder) {
    builder.onResolve({ filter: /^@\/lib\/supabase\/server$/ }, () => ({ path: 'client', namespace: 'fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: `
      export const fixture = {user:'owner',fail:false,calls:[]};
      export const createClient=async()=>({auth:{getUser:async()=>({data:{user:fixture.user?{id:fixture.user}:null}})},rpc:async(...args)=>{fixture.calls.push(args);return {error:fixture.fail?{}:null}}});
    ` }));
  } }],
});
const { activePracticeDelta, validPracticeIntervals, practiceHours, POST, fixture } = await import(`data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString('base64')}`);
const interval = () => ({ start: Date.now() - 15_000, end: Date.now() - 100 });
const request = (changes = {}, origin = 'http://localhost:3000') => new Request('http://localhost:3000/api/practice-time', {
  method: 'POST', headers: { origin, 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId: 'owner', area: 'grammar', level: 'B2', intervals: [interval()], ...changes }),
});
test('timer counts active thinking time but stops exactly at idle cutoff', () => {
  assert.equal(activePracticeDelta(10_000, 11_000, 0, true), 1000);
  assert.equal(activePracticeDelta(59_500, 60_500, 0, true), 500);
  assert.equal(activePracticeDelta(61_000, 62_000, 0, true), 0);
  assert.equal(activePracticeDelta(61_000, 62_000, 61_000, true), 1000);
});
test('hidden pages, inactive stages, suspended timers and clock reversal add no time', () => {
  assert.equal(activePracticeDelta(0, 1000, 0, false), 0);
  assert.equal(activePracticeDelta(0, 60_000, 60_000, true), 0);
  assert.equal(activePracticeDelta(10_000, 9000, 0, true), 0);
});
test('interval validation rejects historic, future, oversized and malformed reports', () => {
  const now = Date.now();
  assert.equal(validPracticeIntervals([interval()], now), true);
  for (const value of [[], [{start:now-360_000,end:now-350_000}], [{start:now,end:now+6000}], [{start:now-40_000,end:now}], [{start:now,end:now-1}], [{start:'1',end:now}], Array(21).fill(interval())])
    assert.equal(validPracticeIntervals(value, now), false);
});
test('hours never round up or hide a short positive practice', () => {
  assert.equal(practiceHours(0), '0');
  assert.equal(practiceHours(15), '<0.01');
  assert.equal(practiceHours(5400), '1.5');
  assert.equal(practiceHours(3599), '0.99');
});
test('route authenticates, binds queued time to its owner, and rejects cross-site posts', async () => {
  fixture.calls = [];
  assert.equal((await POST(request({}, 'https://other.example'))).status, 403);
  fixture.user = null;
  assert.equal((await POST(request())).status, 401);
  fixture.user = 'other';
  assert.equal((await POST(request())).status, 409);
  assert.equal(fixture.calls.length, 0);
  fixture.user = 'owner';
});
test('route reports failed saves and forwards only bounded intervals and scope', async () => {
  fixture.fail = true;
  assert.equal((await POST(request())).status, 503);
  fixture.fail = false;
  const response = await POST(request());
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(fixture.calls.at(-1)[0], 'record_practice_time');
  assert.equal(fixture.calls.at(-1)[1].p_level, 'B2');
  assert.equal((await POST(request({level:'C3'}))).status, 400);
  assert.equal((await POST(request({intervals:[{start:1,end:2}]}))).status, 400);
  assert.equal((await POST(request({extra:'a'.repeat(4500)}))).status, 413);
});
