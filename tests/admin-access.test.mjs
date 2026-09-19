import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

const bundle = await build({
  stdin: { contents: `export {hasAdminPrivilege} from './lib/admin-access'; export {getAccountPrivileges} from './lib/supabase/admin-access'; export {GET} from './app/api/account/privileges/route'; export {updateSession} from './lib/supabase/proxy'; export {state} from 'fixture';`, resolveDir: process.cwd() },
  bundle: true, write: false, platform: 'node', format: 'esm',
  plugins: [{ name: 'auth-fixtures', setup(builder) {
    builder.onResolve({ filter: /^(fixture|@\/lib\/supabase\/(server|config)|@supabase\/ssr|next\/server)$/ }, ({ path }) => ({ path, namespace: 'fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, ({ path }) => ({ contents:
      path === 'fixture' ? `export const state={user:null,error:null,fail:false}; export const client={auth:{getUser:async()=>{if(state.fail)throw Error('Unavailable');return {data:{user:state.user},error:state.error};},getClaims:async()=>({data:{claims:{sub:state.user?.id}}})}};`
      : path === '@/lib/supabase/server' ? `import {client} from 'fixture';export const createClient=async()=>client;`
      : path === '@/lib/supabase/config' ? `export const requireSupabaseConfig=()=>({url:'https://example.supabase.co',publishableKey:'public'});`
      : path === '@supabase/ssr' ? `import {client} from 'fixture';export const createServerClient=()=>client;`
      : `export class NextResponse extends Response { cookies={getAll:()=>[],set:()=>{}};static next(){return new NextResponse(null,{status:200})};static json(data,init){return new NextResponse(JSON.stringify(data),init)};static redirect(url){return new NextResponse(null,{status:307,headers:{location:String(url)}})}}`
    }));
  } }],
});
const { hasAdminPrivilege, getAccountPrivileges, GET, updateSession, state } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const admin = { id: 'owner-uuid', app_metadata: { kurtes_role: 'admin' } };
const learner = { id: 'learner-uuid', app_metadata: {} };
function setup(user, options = {}) { Object.assign(state, { user, error: null, fail: false }, options); }
function request(path) { const url = new URL(path, 'https://kurtes.example'); url.clone = () => new URL(url); return { nextUrl: url, cookies: { getAll: () => [], set: () => {} } }; }

test('only the explicit protected Supabase role grants access', () => {
  assert.equal(hasAdminPrivilege(admin), true);
  for (const user of [null, learner, { ...learner, user_metadata: { kurtes_role: 'admin', role: 'admin', is_admin: true } }, { ...learner, email: 'kurtfulepp@gmail.com' }, { ...learner, role: 'admin' }, { ...learner, app_metadata: { kurtes_role: true } }, { ...admin, id: '' }]) assert.equal(hasAdminPrivilege(user), false);
});
test('privilege endpoint returns current role and disables caching', async () => {
  setup(admin);
  const response = await GET();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.deepEqual(await response.json(), { userId: admin.id, isAdmin: true });
  setup(learner);
  assert.deepEqual(await (await GET()).json(), { userId: learner.id, isAdmin: false });
});
test('missing auth and Auth failures fail closed', async () => {
  for (const options of [{}, { error: {} }, { fail: true }]) {
    setup(options.error || options.fail ? admin : null, options);
    assert.deepEqual(await getAccountPrivileges(), { userId: null, isAdmin: false });
    assert.equal((await GET()).status, 401);
  }
});
test('all admin page paths deny ordinary learners', async () => {
  setup(learner);
  for (const path of ['/admin', '/admin/approvals/preview', '/admin/future']) assert.equal((await updateSession(request(path))).status, 404);
  assert.equal((await updateSession(request('/home'))).status, 200);
});
test('admin APIs deny learners and signed-out users', async () => {
  setup(learner);
  assert.equal((await updateSession(request('/api/admin/approve'))).status, 403);
  setup(null);
  assert.equal((await updateSession(request('/api/admin/approve'))).status, 401);
  assert.equal((await updateSession(request('/admin'))).status, 307);
});
test('admin succeeds and revocation takes effect without waiting for JWT expiry', async () => {
  setup(admin);
  assert.equal((await updateSession(request('/admin'))).status, 200);
  assert.equal((await updateSession(request('/api/admin/approve'))).status, 200);
  // Identity stays the same; the fresh Auth record no longer has the role.
  setup({ ...admin, app_metadata: {} });
  assert.equal((await updateSession(request('/admin'))).status, 404);
  assert.equal((await updateSession(request('/api/admin/approve'))).status, 403);
});
test('admin routes deny access when Auth is unavailable or rejects the user', async () => {
  for (const options of [{ error: {} }, { fail: true }]) {
    setup(admin, options);
    assert.equal((await updateSession(request('/admin'))).status, 404);
  }
});

test('only authenticated Conversation permits the microphone; photo capture stays scoped', async () => {
  setup(learner);
  for (const path of ['/conversation', '/home', '/vocabulary/from-photo']) {
    const policy = (await updateSession(request(path))).headers.get('Permissions-Policy');
    assert.ok(policy.includes(`microphone=${path === '/conversation' ? '(self)' : '()'}`));
    assert.ok(policy.includes(`camera=${path === '/vocabulary/from-photo' ? '(self)' : '()'}`));
  }
  setup(null);
  assert.ok((await updateSession(request('/conversation'))).headers.get('Permissions-Policy').includes('microphone=()'));
});
