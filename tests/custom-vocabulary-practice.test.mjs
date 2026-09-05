import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
const { outputFiles } = await build({ entryPoints: ['lib/custom-vocabulary-practice.ts'], bundle: true, write: false, format: 'esm', platform: 'browser' });
const { practiceQueue, recordReview, loadPractice } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
test('practice prioritizes unreviewed and learning words; review all includes confident words', () => {
  assert.deepEqual(practiceQueue(4, { 0:'confident', 2:'learning' }), [1,2,3]);
  assert.deepEqual(practiceQueue(2, { 0:'confident',1:'confident' }), []);
  assert.deepEqual(practiceQueue(2, { 0:'confident',1:'confident' }, true), [0,1]);
  assert.deepEqual(practiceQueue(0, {}), []);
});
test('review sends only a list ID, index and rating; no owner override or image', async () => {
  const expected = { practiced_count:2, confident_count:1, completed:false };
  const result = await recordReview({ rpc: async(name,args) => {
    assert.equal(name,'record_custom_vocabulary_review');
    assert.deepEqual(args, { p_list_id:'list-id',p_word_index:1,p_status:'learning' }); return { data:expected,error:null };
  } },'list-id',1,'learning'); assert.deepEqual(result,expected);
});
test('review failures keep errors safe and never silently retry', async () => {
  for (const response of [{error:{message:'secret'},data:null},{error:null,data:{}},{error:null,data:{practiced_count:1,confident_count:1,completed:'yes'}}]) {
    let calls=0;
    await assert.rejects(recordReview({rpc:async()=>{calls++;return response;}},'id',0,'confident'),/could not be saved/);
    assert.equal(calls,1);
  }
});
test('missing lists cannot enter practice', async () => {
  const query = { select(){return this;},eq(){return this;},is(){return this;},maybeSingle:async()=>({data:null,error:null}) };
  await assert.rejects(loadPractice({from:()=>query},'owner','id'),/unavailable/);
});
test('a fresh practice load reconstructs saved progress across all pages', async () => {
  const calls=[];
  const client = { from(table) {
    const call={table,filters:[]};calls.push(call);
    const query={select(){return this;},eq(key,value){call.filters.push([key,value]);return this;},is(key,value){call.filters.push([key,value]);return this;},order(){return this;},
      async maybeSingle(){return {data:{id:'list',name:'Saved list',words:Array.from({length:105},()=>({english:'word',spanish:'palabra'})),created_at:'2026-09-05',source:'photo',completed:false,practiced_count:105,confident_count:104},error:null};},
      async range(start,end){return {data:Array.from({length:Math.max(0,Math.min(105,end+1)-start)},(_,i)=>({word_index:start+i,status:start+i===104?'learning':'confident'})),error:null};}
    };return query;
  }};
  const result=await loadPractice(client,'owner','list');
  assert.equal(result.list.practicedCount,105);assert.equal(Object.keys(result.progress).length,105);
  assert.deepEqual(practiceQueue(result.list.words.length,result.progress),[104]);
  for(const call of calls)assert.ok(call.filters.some(([key,value])=>key==='user_id'&&value==='owner'));
});
