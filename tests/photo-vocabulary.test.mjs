import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';

// Bundle the actual Worker-compatible handler, without adding a test framework.
const { outputFiles } = await build({
  entryPoints: ['lib/server/photo-vocabulary.ts'],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'browser',
});
const { analyzePhotoRequest, MAX_PHOTO_BYTES } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`
);
const photo = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
const vocabulary = {
  suggested_title: 'Kitchen',
  items: [{ english: 'frying pan', spanish: 'la sartén', usage_note: null }],
};
const completed = (result = vocabulary) => ({
  status: 'completed',
  output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(result) }] }],
});
const request = (body = photo, headers = {}) => new Request('https://kurtes.example/api/vocabulary/analyze-photo', {
  method: 'POST', body, headers: { 'Content-Type': 'image/png', ...headers },
});
function dependencies(overrides = {}) {
  return {
    apiKey: 'test-secret',
    authenticate: async () => true,
    consumeQuota: async () => true,
    fetcher: async () => Response.json(completed()),
    ...overrides,
  };
}
const mustNotCall = async () => { assert.fail('Unexpected downstream call'); };

test('sign-in, configuration, and cross-site checks block analysis before reading an image', async () => {
  for (const [deps, headers, expected] of [
    [dependencies({ authenticate: async () => false, consumeQuota: mustNotCall, fetcher: mustNotCall }), {}, 401],
    [dependencies({ apiKey: '', consumeQuota: mustNotCall, fetcher: mustNotCall }), {}, 503],
    [dependencies({ authenticate: mustNotCall, consumeQuota: mustNotCall, fetcher: mustNotCall }), { 'sec-fetch-site': 'cross-site' }, 403],
  ]) {
    const response = await analyzePhotoRequest(request(photo, headers), deps);
    assert.equal(response.status, expected);
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
});

test('rejects unsupported formats, empty uploads, and spoofed image content', async () => {
  for (const [body, headers, expected] of [
    [photo, { 'content-type': 'image/svg+xml' }, 415],
    ['', {}, 400],
    ['This is not a photo', {}, 415],
    [photo, { 'content-type': 'image/jpeg' }, 415],
  ]) {
    const response = await analyzePhotoRequest(request(body, headers), dependencies({ consumeQuota: mustNotCall, fetcher: mustNotCall }));
    assert.equal(response.status, expected);
  }
});

test('limits declared and actual upload size before spending quota', async () => {
  for (const upload of [
    request(photo, { 'content-length': String(MAX_PHOTO_BYTES + 1) }),
    request(new Uint8Array(MAX_PHOTO_BYTES + 1), { 'content-length': '1' }),
    request(new Uint8Array(MAX_PHOTO_BYTES + 1)),
  ]) {
    const response = await analyzePhotoRequest(upload, dependencies({ consumeQuota: mustNotCall, fetcher: mustNotCall }));
    assert.equal(response.status, 413);
  }
});

test('fails closed when quota is exhausted or its database is unavailable', async () => {
  for (const [consumeQuota, expected] of [
    [async () => false, 429],
    [async () => { throw new Error('private database details'); }, 503],
  ]) {
    const response = await analyzePhotoRequest(request(), dependencies({ consumeQuota, fetcher: mustNotCall }));
    assert.equal(response.status, expected);
    assert.doesNotMatch(await response.text(), /private database/);
  }
});

test('uses inline input and a non-stored foreground response; returns only reviewable vocabulary', async () => {
  let callCount = 0;
  const response = await analyzePhotoRequest(request(), dependencies({
    fetcher: async (url, options) => {
      callCount++;
      assert.equal(url, 'https://api.openai.com/v1/responses');
      assert.equal(options.headers.Authorization, 'Bearer test-secret');
      const body = JSON.parse(options.body);
      assert.equal(body.store, false);
      assert.equal(body.background, false);
      assert.equal(body.text.format.strict, true);
      assert.equal(body.text.format.schema.properties.items.maxItems, 15);
      assert.equal(body.input[0].content[1].image_url, `data:image/png;base64,${photo.toString('base64')}`);
      assert.equal(body.tools, undefined);
      assert.equal(body.conversation, undefined);
      assert.equal(body.previous_response_id, undefined);
      assert.ok(options.signal);
      return Response.json({ ...completed(), id: 'private-provider-id', usage: { input_tokens: 100 } });
    },
  }));
  assert.equal(callCount, 1);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { ...vocabulary, requires_review: true });
});

test('empty scenes are valid and repeated English entries are collapsed', async () => {
  for (const [result, count] of [
    [{ suggested_title: 'Photo', items: [] }, 0],
    [{ ...vocabulary, items: [...vocabulary.items, { ...vocabulary.items[0], english: ' FRYING PAN ' }] }, 1],
  ]) {
    const response = await analyzePhotoRequest(request(), dependencies({ fetcher: async () => Response.json(completed(result)) }));
    assert.equal(response.status, 200);
    assert.equal((await response.json()).items.length, count);
  }
});

test('refusals and incomplete generations cannot be mistaken for accepted vocabulary', async () => {
  for (const [output, expected] of [
    [{ status: 'incomplete', output: [] }, 502],
    [{ status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'private refusal text' }] }] }, 422],
  ]) {
    const response = await analyzePhotoRequest(request(), dependencies({ fetcher: async () => Response.json(output) }));
    assert.equal(response.status, expected);
    assert.doesNotMatch(await response.text(), /private refusal/);
  }
});

test('validates provider output locally even with Structured Outputs', async () => {
  for (const output of [
    completed({ suggested_title: ' ', items: [] }),
    completed({ ...vocabulary, items: Array(16).fill(vocabulary.items[0]) }),
    completed({ ...vocabulary, items: [{ english: 'pan', spanish: 123, usage_note: null }] }),
    { status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: 'not JSON' }] }] },
    { status: 'completed', output: [] },
  ]) {
    const response = await analyzePhotoRequest(request(), dependencies({ fetcher: async () => Response.json(output) }));
    assert.equal(response.status, 502);
    assert.equal((await response.json()).items, undefined);
  }
});

test('provider failures do not expose response bodies, credentials, or photos', async () => {
  for (const [status, expected] of [[400, 422], [401, 502], [429, 429], [500, 502]]) {
    let calls = 0;
    const response = await analyzePhotoRequest(request(), dependencies({ fetcher: async () => {
      calls++;
      return Response.json({ error: 'test-secret private-image-bytes' }, { status });
    } }));
    assert.equal(response.status, expected);
    assert.equal(calls, 1, 'No automatic image resubmission');
    assert.doesNotMatch(await response.text(), /test-secret|private-image/);
  }
});

test('network and timeout errors are sanitized', async () => {
  for (const [error, expected] of [[new Error('private details'), 502], [new DOMException('timeout', 'TimeoutError'), 504]]) {
    const response = await analyzePhotoRequest(request(), dependencies({ fetcher: async () => { throw error; } }));
    assert.equal(response.status, expected);
    assert.doesNotMatch(await response.text(), /private details/);
  }
});
