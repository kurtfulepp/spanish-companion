import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
const built=await build({stdin:{contents:`export {POST} from './app/api/speech/route';export {readBoundedText} from './lib/server/request-body';export {state} from 'fixture';`,resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm',plugins:[{name:'fixtures',setup(b){
  b.onResolve({filter:/^(fixture|next\/server|@\/lib\/supabase\/server)$/},({path})=>({path,namespace:'fixture'}));
  b.onLoad({filter:/.*/,namespace:'fixture'},({path})=>({contents:path==='fixture'?`export const state={signedIn:true,quota:true,quotaCalls:0};`:path==='next/server'?`export const NextResponse=Response;`:`import {state} from 'fixture';export const createClient=async()=>({auth:{getUser:async()=>({data:{user:state.signedIn?{id:'owner'}:null}})},rpc:async()=>{state.quotaCalls++;return {data:state.quota}}});`}));
}}]});
const {POST,readBoundedText,state}=await import(`data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString('base64')}`);
const request=(body,headers={})=>new Request('https://kurtes.example/api/speech',{method:'POST',body,headers});
test('bounded reader cancels oversized UTF-8 streams before their remaining data is consumed',async()=>{
  let cancelled=false;
  const stream=new ReadableStream({pull(c){c.enqueue(new TextEncoder().encode('á'.repeat(20)));},cancel(){cancelled=true;}});
  const r=new Request('https://kurtes.example',{method:'POST',body:stream,duplex:'half'});
  assert.equal(await readBoundedText(r,30),null);assert.equal(cancelled,true);
  assert.equal(await readBoundedText(request('á'),2),'á');
  assert.equal(await readBoundedText(request('{}',{'content-length':'9000'}),4096),null);
});
test('speech rejects cross-origin, anonymous, null, array, malformed and oversized input without provider calls',async()=>{
  const original=globalThis.fetch;
  globalThis.fetch=async()=>{throw Error('Unexpected provider request');};
  try{
    assert.equal((await POST(request('{}',{origin:'https://attacker.example'}))).status,403);
    state.signedIn=false;assert.equal((await POST(request('{}'))).status,401);state.signedIn=true;
    for(const value of ['null','[]','{'])assert.equal((await POST(request(value))).status,400);
    assert.equal((await POST(request(' '.repeat(4097)))).status,413);
    assert.equal(state.quotaCalls,0);
  }finally{globalThis.fetch=original;}
});
test('speech fails closed on quota and sanitizes provider errors; valid audio remains playable',async()=>{
  const original=globalThis.fetch;const oldKey=process.env.ELEVENLABS_API_KEY;const oldVoice=process.env.ELEVENLABS_MALE_VOICE_ID;
  process.env.ELEVENLABS_API_KEY='test-not-a-key';process.env.ELEVENLABS_MALE_VOICE_ID='test-voice';
  const send=()=>POST(request(JSON.stringify({text:'Hola.',voice:'male'})));
  try{
    state.quota='true';assert.equal((await send()).status,429);state.quota=true;
    globalThis.fetch=async(_url,init)=>{assert.ok(init.signal);throw Error('private-provider-details');};
    const failed=await send();assert.equal(failed.status,503);assert.ok(!(await failed.text()).includes('private-provider-details'));
    for(const body of ['null','{',JSON.stringify({})]){globalThis.fetch=async()=>new Response(body);assert.equal((await send()).status,502);}
    globalThis.fetch=async()=>Response.json({audio_base64:'test-audio',alignment:{characters:['H'],character_start_times_seconds:[-1],character_end_times_seconds:[0]}});
    assert.deepEqual(await (await send()).json(),{audioBase64:'test-audio',alignment:null});
  }finally{globalThis.fetch=original;if(oldKey===undefined)delete process.env.ELEVENLABS_API_KEY;else process.env.ELEVENLABS_API_KEY=oldKey;if(oldVoice===undefined)delete process.env.ELEVENLABS_MALE_VOICE_ID;else process.env.ELEVENLABS_MALE_VOICE_ID=oldVoice;}
});
