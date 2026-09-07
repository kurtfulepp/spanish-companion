const audioCache = new Map<string, string>();
const pendingAudio = new Map<string, Promise<string>>();
let activeAudio: HTMLAudioElement | null = null;
let finishActivePlayback: (() => void) | null = null;
let finishBrowserPlayback: (() => void) | null = null;
let playbackVersion = 0;

/** Also invalidates audio still being fetched so it cannot start after recording begins. */
export function stopSpanishSpeech() {
  playbackVersion += 1;
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }
  finishActivePlayback?.();
  finishBrowserPlayback?.();
  if (typeof window !== 'undefined' && 'speechSynthesis' in window)
    window.speechSynthesis.cancel();
}

export type VoicePreference = 'male' | 'female';

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

export async function playSpanishSpeech(
  text: string,
  voice: VoicePreference = 'male',
) {
  stopSpanishSpeech();
  const version = playbackVersion;
  const cacheKey = `${voice}:${text}`;

  try {
    let audioUrl = audioCache.get(cacheKey);

    if (!audioUrl) {
      let request = pendingAudio.get(cacheKey);
      if (!request) {
        request = (async () => {
          const response = await fetch('/api/speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, voice }),
          });

          if (!response.ok) throw new Error('Speech generation failed');

          const url = URL.createObjectURL(await response.blob());
          audioCache.set(cacheKey, url);
          return url;
        })();
        pendingAudio.set(cacheKey, request);
        void request.then(
          () => pendingAudio.delete(cacheKey),
          () => pendingAudio.delete(cacheKey),
        );
      }
      audioUrl = await request;
    }

    if (version !== playbackVersion) return;

    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      finishActivePlayback?.();
    }

    const audio = new Audio(audioUrl);
    activeAudio = audio;
    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const cleanup = () => {
        audio.removeEventListener('ended', finish);
        audio.removeEventListener('error', fail);
        if (activeAudio === audio) activeAudio = null;
        if (finishActivePlayback === finish) finishActivePlayback = null;
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
      finishActivePlayback = finish;
      audio.addEventListener('ended', finish, { once: true });
      audio.addEventListener('error', fail, { once: true });
      void audio.play().catch(fail);
    });
  } catch {
    if (version !== playbackVersion) return;
    await speakWithBrowser(text);
  }
}
