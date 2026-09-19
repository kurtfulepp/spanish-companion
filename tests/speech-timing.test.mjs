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

const speech = await bundled('lib/speech.ts');

function alignment(text) {
  return {
    characters: [...text],
    characterStartTimesSeconds: [...text].map((_, index) => index / 10),
    characterEndTimesSeconds: [...text].map((_, index) => (index + 1) / 10),
  };
}

test('groups exact expression text into timed replayable words', () => {
  const text = '¿Nos trae la cuenta?';
  const words = speech.buildSpeechWords(text, alignment(text));
  assert.deepEqual(
    words.map(({ text: word, startOffset, endOffset }) => ({
      word,
      startOffset,
      endOffset,
    })),
    [
      { word: '¿Nos', startOffset: 0, endOffset: 4 },
      { word: 'trae', startOffset: 5, endOffset: 9 },
      { word: 'la', startOffset: 10, endOffset: 12 },
      { word: 'cuenta?', startOffset: 13, endOffset: 20 },
    ],
  );
});

test('rejects mismatched timing instead of highlighting the wrong word', () => {
  assert.deepEqual(
    speech.buildSpeechWords('una mesa', alignment('otra mesa')),
    [],
  );
});

test('replays cached phrase audio and word slices without another API call', async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  const originalAudio = globalThis.Audio;
  const originalUrl = globalThis.URL;
  const text = 'Una mesa, por favor.';
  let fetches = 0;
  let plays = 0;
  const sourceStarts = [];

  class AudioStub {
    currentTime = 0;
    readyState = 1;
    listeners = new Map();
    addEventListener(name, listener) {
      this.listeners.set(name, listener);
    }
    removeEventListener(name, listener) {
      if (this.listeners.get(name) === listener) this.listeners.delete(name);
    }
    pause() {}
    load() {}
    play() {
      plays += 1;
      queueMicrotask(() => this.listeners.get('ended')?.());
      return Promise.resolve();
    }
  }

  class AudioContextStub {
    state = 'running';
    currentTime = 10;
    destination = {};
    resume() {
      return Promise.resolve();
    }
    decodeAudioData() {
      return Promise.resolve({ duration: 10 });
    }
    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime() {},
        },
        connect() {},
        disconnect() {},
      };
    }
    createBufferSource() {
      return {
        buffer: null,
        onended: null,
        connect() {},
        disconnect() {},
        stop() {},
        start(when, offset, duration) {
          sourceStarts.push({ when, offset, duration });
          queueMicrotask(() => this.onended?.());
        },
      };
    }
  }

  globalThis.window = {
    AudioContext: AudioContextStub,
    atob: (value) => Buffer.from(value, 'base64').toString('binary'),
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
    speechSynthesis: { cancel() {} },
  };
  globalThis.Audio = AudioStub;
  globalThis.URL = {
    ...originalUrl,
    createObjectURL: () => 'blob:cached-audio',
  };
  globalThis.fetch = async () => {
    fetches += 1;
    return Response.json({
      audioBase64: Buffer.from('audio').toString('base64'),
      alignment: alignment(text),
    });
  };

  try {
    await speech.playSpanishSpeech(text);
    await speech.playSpanishSpeech(text);
    const asset = speech.getCachedSpanishSpeech(text);
    assert.ok(asset);
    await speech.playCachedSpanishWord(text, 'male', asset.words[0]);
    assert.equal(fetches, 1);
    assert.equal(plays, 2);
    assert.equal(sourceStarts.length, 1);
    const replay = speech.wordReplayWindow(asset.words[0], 10);
    assert.deepEqual(sourceStarts[0], {
      when: 0,
      offset: replay.start,
      duration: replay.duration,
    });
  } finally {
    globalThis.fetch = originalFetch;
    globalThis.window = originalWindow;
    globalThis.Audio = originalAudio;
    globalThis.URL = originalUrl;
  }
});
