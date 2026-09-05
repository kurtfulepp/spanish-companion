import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
const { outputFiles } = await build({entryPoints:['lib/photo-analysis.ts'],bundle:true,write:false,format:'esm',platform:'browser'});
const { requestPhotoAnalysis } = await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
const result = { suggested_title:'Kitchen', items:[{english:'mug',spanish:'la taza',usage_note:null}], requires_review:true };
const photo = new Blob(['image fixture'],{type:'image/jpeg'});

test('sends one raw photo with auth cookies, abort signal, and no cache',async()=>{
  const controller=new AbortController(); let calls=0;
  const actual=await requestPhotoAnalysis(photo,controller.signal,async(url,init)=>{
    calls++; assert.equal(url,'/api/vocabulary/analyze-photo'); assert.equal(init.body,photo); assert.equal(init.credentials,'same-origin'); assert.equal(init.signal,controller.signal); assert.equal(init.cache,'no-store');
    return Response.json(result);
  });
  assert.equal(calls,1); assert.deepEqual(actual,result);
});
test('handles empty scenes without injecting demo words',async()=>{
  const actual=await requestPhotoAnalysis(photo,new AbortController().signal,async()=>Response.json({...result,items:[]}));
  assert.deepEqual(actual.items,[]);
});
test('rejects malformed results and reports caps without retrying',async()=>{
  for(const response of [Response.json({...result,requires_review:false}),Response.json({...result,items:[null]}),Response.json({...result,items:[{english:'mug',spanish:2,usage_note:null}]}),Response.json({code:'vision_limit_reached',error:'private details'},{status:429})]){
    let calls=0;
    await assert.rejects(()=>requestPhotoAnalysis(photo,new AbortController().signal,async()=>{calls++;return response;}),error=>!error.message.includes('private details'));
    assert.equal(calls,1);
  }
});
