export type VoicePreference = 'male' | 'female';

export type SpeechAlignment = {
  characters: string[];
  characterStartTimesSeconds: number[];
  characterEndTimesSeconds: number[];
};

export type SpeechWordTiming = {
  text: string;
  start: number;
  end: number;
  startOffset: number;
  endOffset: number;
};

export type TimedSpeechAsset = {
  audioUrl: string;
  audioBytes: ArrayBuffer;
  words: SpeechWordTiming[];
  decodedAudio?: Promise<AudioBuffer>;
};

type SpeechPlaybackOptions = {
  onAsset?: (asset: TimedSpeechAsset) => void;
  onTime?: (time: number | null) => void;
};

type SpeechApiResponse = {
  audioBase64?: unknown;
  alignment?: unknown;
};

const audioCache = new Map<string, TimedSpeechAsset>();
const pendingAudio = new Map<string, Promise<TimedSpeechAsset>>();
let activeAudio: HTMLAudioElement | null = null;
let activeSource: AudioBufferSourceNode | null = null;
let activeGain: GainNode | null = null;
let finishActivePlayback: (() => void) | null = null;
let finishBrowserPlayback: (() => void) | null = null;
let playbackVersion = 0;
let sharedAudioContext: AudioContext | null = null;

const WORD_LEAD_SECONDS = 0.018;
const WORD_TAIL_SECONDS = 0.045;
const WORD_FADE_SECONDS = 0.012;

function cacheKey(text: string, voice: VoicePreference) {
  return `${voice}:${text}`;
}

/** Also invalidates audio still being fetched so it cannot start after recording begins. */
export function stopSpanishSpeech() {
  playbackVersion += 1;
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
  if (activeSource) {
    activeSource.onended = null;
    try {
      activeSource.stop();
    } catch {
      // A source that has already ended cannot be stopped again.
    }
    activeSource.disconnect();
    activeSource = null;
  }
  activeGain?.disconnect();
  activeGain = null;
  finishActivePlayback?.();
  finishBrowserPlayback?.();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window)
    window.speechSynthesis.cancel();
}

function speakWithBrowser(text: string) {
  if (!('speechSynthesis' in window)) {
    return Promise.reject(new Error('Speech playback is unavailable'));
  }

  return new Promise<void>((resolve, reject) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.88;
    const finish = () => {
      if (finishBrowserPlayback === finish) finishBrowserPlayback = null;
      resolve();
    };
    finishBrowserPlayback = finish;
    utterance.onend = finish;
    utterance.onerror = () => {
      if (finishBrowserPlayback === finish) finishBrowserPlayback = null;
      reject(
        new Error('Speech playback is unavailable. Use Listen to try again.'),
      );
    };
    window.speechSynthesis.speak(utterance);
  });
}

function isFiniteNumberArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => typeof entry === 'number' && Number.isFinite(entry))
  );
}

function parseAlignment(value: unknown): SpeechAlignment | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  const characters = candidate.characters;
  const starts = candidate.characterStartTimesSeconds;
  const ends = candidate.characterEndTimesSeconds;

  if (
    !Array.isArray(characters) ||
    !characters.every((entry) => typeof entry === 'string') ||
    !isFiniteNumberArray(starts) ||
    !isFiniteNumberArray(ends) ||
    characters.length !== starts.length ||
    characters.length !== ends.length
  ) {
    return null;
  }

  return {
    characters,
    characterStartTimesSeconds: starts,
    characterEndTimesSeconds: ends,
  };
}

/** Converts character timing into exact, whitespace-delimited replay targets. */
export function buildSpeechWords(
  text: string,
  alignment: SpeechAlignment | null,
): SpeechWordTiming[] {
  if (!alignment || alignment.characters.join('') !== text) return [];

  const words: SpeechWordTiming[] = [];
  let wordStart = -1;
  let offset = 0;
  let wordStartOffset = 0;

  const closeWord = (endIndex: number, endOffset: number) => {
    if (wordStart < 0) return;
    const start = alignment.characterStartTimesSeconds[wordStart];
    const end = alignment.characterEndTimesSeconds[endIndex];
    if (start >= 0 && end > start) {
      words.push({
        text: text.slice(wordStartOffset, endOffset),
        start,
        end,
        startOffset: wordStartOffset,
        endOffset,
      });
    }
    wordStart = -1;
  };

  alignment.characters.forEach((character, index) => {
    const nextOffset = offset + character.length;
    if (/^\s+$/u.test(character)) {
      closeWord(index - 1, offset);
    } else if (wordStart < 0) {
      wordStart = index;
      wordStartOffset = offset;
    }
    offset = nextOffset;
  });
  closeWord(alignment.characters.length - 1, offset);

  return words;
}

function audioFromBase64(value: string) {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const audioBytes = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  return {
    audioBytes,
    audioUrl: URL.createObjectURL(
      new Blob([audioBytes], { type: 'audio/mpeg' }),
    ),
  };
}

function prepareAudioContext() {
  if (!window.AudioContext) return Promise.resolve<AudioContext | null>(null);
  sharedAudioContext ??= new window.AudioContext();
  if (sharedAudioContext.state === 'suspended') {
    return sharedAudioContext.resume().then(() => sharedAudioContext);
  }
  return Promise.resolve(sharedAudioContext);
}

function decodeAudio(asset: TimedSpeechAsset, context: AudioContext) {
  asset.decodedAudio ??= context
    .decodeAudioData(asset.audioBytes.slice(0))
    .catch((error) => {
      asset.decodedAudio = undefined;
      throw error;
    });
  return asset.decodedAudio;
}

export function wordReplayWindow(
  word: SpeechWordTiming,
  audioDuration: number,
) {
  const start = Math.max(0, word.start - WORD_LEAD_SECONDS);
  const end = Math.min(audioDuration, word.end + WORD_TAIL_SECONDS);
  return { start, duration: Math.max(0, end - start) };
}

async function loadSpanishSpeech(
  text: string,
  voice: VoicePreference,
): Promise<TimedSpeechAsset> {
  const key = cacheKey(text, voice);
  const cached = audioCache.get(key);
  if (cached) return cached;

  let request = pendingAudio.get(key);
  if (!request) {
    request = (async () => {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      });
      if (!response.ok) throw new Error('Speech generation failed');

      const payload = (await response.json()) as SpeechApiResponse;
      if (typeof payload.audioBase64 !== 'string' || !payload.audioBase64) {
        throw new Error('Speech generation returned invalid audio');
      }
      const alignment = parseAlignment(payload.alignment);
      const audio = audioFromBase64(payload.audioBase64);
      const asset = {
        ...audio,
        words: buildSpeechWords(text, alignment),
      };
      audioCache.set(key, asset);
      return asset;
    })();
    pendingAudio.set(key, request);
    void request.then(
      () => pendingAudio.delete(key),
      () => pendingAudio.delete(key),
    );
  }
  return request;
}

async function playDecodedWord(
  asset: TimedSpeechAsset,
  word: SpeechWordTiming,
  context: AudioContext,
  version: number,
  options: Pick<SpeechPlaybackOptions, 'onTime'>,
) {
  const buffer = await decodeAudio(asset, context);
  if (version !== playbackVersion) return;

  const { start, duration } = wordReplayWindow(word, buffer.duration);
  if (!duration) throw new Error('Speech timing is unavailable');

  const source = context.createBufferSource();
  const gain = context.createGain();
  const startedAt = context.currentTime;
  const fade = Math.min(WORD_FADE_SECONDS, duration / 3);
  source.buffer = buffer;
  source.connect(gain);
  gain.connect(context.destination);
  gain.gain.setValueAtTime(0, startedAt);
  gain.gain.linearRampToValueAtTime(1, startedAt + fade);
  gain.gain.setValueAtTime(1, startedAt + duration - fade);
  gain.gain.linearRampToValueAtTime(0, startedAt + duration);
  activeSource = source;
  activeGain = gain;

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    let frame = 0;
    const cleanup = () => {
      if (frame) window.cancelAnimationFrame(frame);
      source.onended = null;
      source.disconnect();
      gain.disconnect();
      if (activeSource === source) activeSource = null;
      if (activeGain === gain) activeGain = null;
      if (finishActivePlayback === finish) finishActivePlayback = null;
      options.onTime?.(null);
    };
    const finish = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };
    const fail = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('Speech playback failed'));
    };
    const tick = () => {
      if (settled || version !== playbackVersion) return;
      const elapsed = context.currentTime - startedAt;
      options.onTime?.(start + Math.max(0, elapsed));
      frame = window.requestAnimationFrame(tick);
    };

    finishActivePlayback = finish;
    source.onended = finish;
    options.onTime?.(word.start);
    frame = window.requestAnimationFrame(tick);
    try {
      source.start(0, start, duration);
    } catch {
      fail();
    }
  });
}

export function getCachedSpanishSpeech(
  text: string,
  voice: VoicePreference = 'male',
) {
  return audioCache.get(cacheKey(text, voice)) ?? null;
}

function playAudio(
  asset: TimedSpeechAsset,
  version: number,
  options: SpeechPlaybackOptions,
  range?: { start: number; end: number },
) {
  const audio = new Audio(asset.audioUrl);
  activeAudio = audio;

  return new Promise<void>((resolve, reject) => {
    let settled = false;
    let frame = 0;
    let started = false;

    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', start);
      audio.removeEventListener('ended', finish);
      audio.removeEventListener('error', fail);
      if (frame) window.cancelAnimationFrame(frame);
      if (activeAudio === audio) activeAudio = null;
      if (finishActivePlayback === finish) finishActivePlayback = null;
      options.onTime?.(null);
    };
    const finish = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };
    const fail = () => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error('Speech playback failed'));
    };
    const tick = () => {
      if (settled || version !== playbackVersion) return;
      if (range && audio.currentTime >= range.end) {
        audio.pause();
        finish();
        return;
      }
      options.onTime?.(audio.currentTime);
      frame = window.requestAnimationFrame(tick);
    };
    const start = () => {
      if (started || settled || version !== playbackVersion) return;
      started = true;
      if (range) audio.currentTime = range.start;
      options.onTime?.(audio.currentTime);
      frame = window.requestAnimationFrame(tick);
      void audio.play().catch(fail);
    };

    finishActivePlayback = finish;
    audio.addEventListener('ended', finish, { once: true });
    audio.addEventListener('error', fail, { once: true });
    if (range && audio.readyState < 1) {
      audio.addEventListener('loadedmetadata', start, { once: true });
      audio.load();
    } else {
      start();
    }
  });
}

export async function playSpanishSpeech(
  text: string,
  voice: VoicePreference = 'male',
  options: SpeechPlaybackOptions = {},
) {
  const audioContext = prepareAudioContext().catch(() => null);
  stopSpanishSpeech();
  const version = playbackVersion;

  try {
    const asset = await loadSpanishSpeech(text, voice);
    if (version !== playbackVersion) return;
    options.onAsset?.(asset);
    void audioContext.then((context) => {
      if (context) void decodeAudio(asset, context).catch(() => undefined);
    });
    await playAudio(asset, version, options);
  } catch {
    if (version !== playbackVersion) return;
    options.onTime?.(null);
    await speakWithBrowser(text);
  }
}

/** Replays an already-cached slice. It never creates a network request. */
export async function playCachedSpanishWord(
  text: string,
  voice: VoicePreference,
  word: SpeechWordTiming,
  options: Pick<SpeechPlaybackOptions, 'onTime'> = {},
) {
  const asset = getCachedSpanishSpeech(text, voice);
  if (!asset) throw new Error('Listen to the expression first');

  stopSpanishSpeech();
  const version = playbackVersion;
  try {
    const context = await prepareAudioContext();
    if (!context) throw new Error('Precise audio playback is unavailable');
    await playDecodedWord(asset, word, context, version, options);
  } catch {
    if (version !== playbackVersion) return;
    const { start, duration } = wordReplayWindow(
      word,
      Number.POSITIVE_INFINITY,
    );
    await playAudio(asset, version, options, {
      start,
      end: start + duration,
    });
  }
}
