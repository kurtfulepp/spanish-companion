import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
async function bundled(path) {
  const { outputFiles } = await build({
    entryPoints: [path],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
  });
  return import(
    `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`
  );
}
const { ConversationRecorder } = await bundled('lib/conversation-recorder.ts');
const { transcribeConversationRequest } = await bundled(
  'lib/server/conversation-transcription.ts',
);
const { MAX_RECORDING_BYTES } = await bundled('lib/conversation-audio.ts');
const catalog = {
  level: 'B1',
  topics: [
    {
      id: 'dining-out',
      scenarios: [
        { id: 'ordering', expressions: [{ id: 'one' }] },
        { id: 'locked', expressions: [] },
      ],
    },
  ],
};
const never = async () => assert.fail('Unexpected downstream operation');
const dependencies = (overrides) => ({
  apiKey: 'test-key',
  authenticate: async () => 'user-1',
  getCatalog: async () => catalog,
  consumeQuota: async () => true,
  fetcher: async () => Response.json({ text: 'Yo quiere sopa.' }),
  ...overrides,
});
function request({
  type = 'audio/webm',
  size = 200,
  topicId = 'dining-out',
  scenarioId = 'ordering',
  level = 'B1',
  ...headers
} = {}) {
  const body = new FormData();
  body.set(
    'audio',
    new Blob([new Uint8Array(size)], { type }),
    'private-original-name.webm',
  );
  body.set('topicId', topicId);
  body.set('scenarioId', scenarioId);
  body.set('level', level);
  return new Request('https://kurtes.example/api/conversation/transcribe', {
    method: 'POST',
    body,
    headers,
  });
}

test('transcription authenticates and rejects cross-site requests before reading audio', async () => {
  assert.equal(
    (
      await transcribeConversationRequest(
        request(),
        dependencies({
          authenticate: async () => null,
          getCatalog: never,
          fetcher: never,
        }),
      )
    ).status,
    401,
  );
  assert.equal(
    (
      await transcribeConversationRequest(
        request({ 'sec-fetch-site': 'cross-site' }),
        dependencies({ authenticate: never, fetcher: never }),
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await transcribeConversationRequest(
        request({ origin: 'https://evil.example' }),
        dependencies({ authenticate: never, fetcher: never }),
      )
    ).status,
    403,
  );
});

test('transcription rejects locked moments and changed profile levels before quota', async () => {
  for (const [input, status] of [
    [{ scenarioId: 'locked' }, 403],
    [{ topicId: 'other' }, 403],
    [{ level: 'A1' }, 409],
  ]) {
    assert.equal(
      (
        await transcribeConversationRequest(
          request(input),
          dependencies({ consumeQuota: never, fetcher: never }),
        )
      ).status,
      status,
    );
  }
});

test('validates recording format and size including chunked requests without Content-Length', async () => {
  for (const [input, status] of [
    [{ type: 'text/plain' }, 415],
    [{ size: 0 }, 400],
    [{ size: MAX_RECORDING_BYTES + 1 }, 413],
    [{ size: MAX_RECORDING_BYTES + 20_000 }, 413],
  ]) {
    const source = request(input);
    const incoming = new Request(source.url, {
      method: 'POST',
      headers: source.headers,
      body: await source.arrayBuffer(),
    });
    assert.equal(
      (
        await transcribeConversationRequest(
          incoming,
          dependencies({ getCatalog: never, fetcher: never }),
        )
      ).status,
      status,
    );
  }
  const malformed = new Request(
    'https://kurtes.example/api/conversation/transcribe',
    { method: 'POST', body: 'not multipart' },
  );
  assert.equal(
    (
      await transcribeConversationRequest(
        malformed,
        dependencies({ fetcher: never }),
      )
    ).status,
    400,
  );
});

test('forwards supported formats with neutral filename and verbatim Spanish transcription; no learning data or credentials in output', async () => {
  for (const [type, extension] of [
    ['audio/webm;codecs=opus', 'webm'],
    ['audio/mp4', 'mp4'],
    ['audio/wav', 'wav'],
  ]) {
    const response = await transcribeConversationRequest(
      request({ type }),
      dependencies({
        fetcher: async (url, init) => {
          assert.equal(url, 'https://api.openai.com/v1/audio/transcriptions');
          assert.equal(init.body.get('file').name, `reply.${extension}`);
          assert.equal(init.body.get('language'), 'es');
          assert.equal(init.body.get('model'), 'gpt-4o-mini-transcribe');
          assert.match(init.body.get('prompt'), /conservando errores/);
          assert.equal(init.body.get('topicId'), null);
          return Response.json({ text: 'Yo quiere sopa.' });
        },
      }),
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { text: 'Yo quiere sopa.' });
    assert.equal(response.headers.get('cache-control'), 'no-store');
  }
});

test('transcription fails honestly on missing key, quota, silence, malformed provider output, network failure', async () => {
  for (const [options, status] of [
    [{ apiKey: '', consumeQuota: never, fetcher: never }, 503],
    [{ consumeQuota: async () => false, fetcher: never }, 429],
    [
      {
        consumeQuota: async () => {
          throw new Error('offline');
        },
        fetcher: never,
      },
      503,
    ],
    [{ fetcher: async () => Response.json({ text: '' }) }, 422],
    [{ fetcher: async () => Response.json({ text: '...' }) }, 422],
    [{ fetcher: async () => Response.json({ text: 'x'.repeat(3001) }) }, 422],
    [{ fetcher: async () => new Response('', { status: 429 }) }, 429],
    [
      {
        fetcher: async () => {
          throw new Error('offline');
        },
      },
      504,
    ],
  ])
    assert.equal(
      (await transcribeConversationRequest(request(), dependencies(options)))
        .status,
      status,
    );
});

function recorderHarness(getStream, supported = 'audio/webm;codecs=opus') {
  const states = [],
    errors = [],
    recordings = [];
  const track = {
    stops: 0,
    onended: null,
    stop() {
      this.stops++;
    },
  };
  const stream = { getTracks: () => [track] };
  let media;
  class FakeRecorder {
    static isTypeSupported = (type) => type === supported;
    constructor(_stream, options) {
      media = this;
      this.mimeType = options.mimeType;
      this.state = 'inactive';
    }
    start() {
      this.state = 'recording';
    }
    stop() {
      this.state = 'inactive';
      queueMicrotask(() => this.onstop?.());
    }
    chunk(size = 200) {
      this.ondataavailable?.({ data: new Blob([new Uint8Array(size)]) });
    }
  }
  const controller = new ConversationRecorder(
    {
      state: (s) => states.push(s),
      seconds: () => {},
      error: (e) => errors.push(e),
      complete: (b) => recordings.push(b),
    },
    { Recorder: FakeRecorder, getStream: getStream || (async () => stream) },
  );
  return {
    controller,
    states,
    errors,
    recordings,
    track,
    stream,
    media: () => media,
  };
}

test('records supported browser format, stops the microphone and emits one completed clip', async () => {
  for (const type of ['audio/webm;codecs=opus', 'audio/mp4']) {
    const h = recorderHarness(undefined, type);
    await h.controller.start();
    h.media().chunk();
    h.controller.stop();
    await new Promise((resolve) => queueMicrotask(resolve));
    assert.ok(h.track.stops > 0);
    assert.equal(h.recordings.length, 1);
    assert.equal(h.recordings[0].type, type);
    assert.deepEqual(h.states, ['requesting', 'recording', 'finishing']);
  }
});

test('cancelling while permission is pending stops late-arriving tracks without recording', async () => {
  let resolve;
  const h = recorderHarness(
    () =>
      new Promise((r) => {
        resolve = r;
      }),
  );
  const pending = h.controller.start();
  h.controller.cancel();
  resolve(h.stream);
  await pending;
  assert.ok(h.track.stops > 0);
  assert.equal(h.media(), undefined);
  assert.equal(h.recordings.length, 0);
});

test('denied, absent and occupied microphones return actionable errors', async () => {
  for (const name of ['NotAllowedError', 'NotFoundError', 'NotReadableError']) {
    const h = recorderHarness(async () => {
      throw Object.assign(new Error('microphone'), { name });
    });
    await h.controller.start();
    assert.equal(h.states.at(-1), 'idle');
    assert.equal(h.errors.length, 1);
    assert.equal(h.recordings.length, 0);
  }
});

test('cancel, disconnected tracks, empty clips and oversized clips never upload stale audio', async () => {
  const cancelled = recorderHarness();
  await cancelled.controller.start();
  cancelled.media().chunk();
  cancelled.controller.cancel();
  await new Promise((resolve) => queueMicrotask(resolve));
  assert.equal(cancelled.recordings.length, 0);
  assert.ok(cancelled.track.stops > 0);
  const lost = recorderHarness();
  await lost.controller.start();
  lost.track.onended();
  assert.equal(lost.recordings.length, 0);
  assert.equal(lost.errors.length, 1);
  const empty = recorderHarness();
  await empty.controller.start();
  empty.controller.stop();
  await new Promise((resolve) => queueMicrotask(resolve));
  assert.equal(empty.recordings.length, 0);
  assert.equal(empty.errors.length, 1);
  const large = recorderHarness();
  await large.controller.start();
  large.media().chunk(MAX_RECORDING_BYTES + 1);
  assert.equal(large.recordings.length, 0);
  assert.equal(large.errors.length, 1);
});

test('stopping speech while generation is pending prevents late audio from starting or falling back', async () => {
  const originalFetch = globalThis.fetch,
    originalWindow = globalThis.window,
    originalAudio = globalThis.Audio;
  let resolve,
    played = 0,
    spoken = 0;
  globalThis.window = {
    speechSynthesis: {
      cancel() {},
      speak() {
        spoken++;
      },
    },
  };
  globalThis.Audio = class {
    constructor() {
      played++;
    }
  };
  globalThis.fetch = () =>
    new Promise((r) => {
      resolve = r;
    });
  try {
    const speech = await bundled('lib/speech.ts');
    const pending = speech.playSpanishSpeech('A pending test phrase');
    speech.stopSpanishSpeech();
    resolve(new Response('', { status: 503 }));
    await pending;
    assert.equal(played, 0);
    assert.equal(spoken, 0);
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
    globalThis.Audio = originalAudio;
  }
});

test('recording automatically finishes at 45 seconds and releases the microphone', async (context) => {
  context.mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'] });
  const h = recorderHarness();
  await h.controller.start();
  h.media().chunk();
  context.mock.timers.tick(45_000);
  await new Promise((resolve) => queueMicrotask(resolve));
  assert.equal(h.recordings.length, 1);
  assert.ok(h.track.stops > 0);
  context.mock.timers.reset();
});
