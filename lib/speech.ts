const audioCache = new Map<string, string>();
const pendingAudio = new Map<string, Promise<string>>();
let activeAudio: HTMLAudioElement | null = null;
let finishActivePlayback: (() => void) | null = null;

export type VoicePreference = 'male' | 'female';

function speakWithBrowser(text: string) {
  if (!('speechSynthesis' in window)) {
    return Promise.reject(new Error('Speech playback is unavailable'));
  }

  return new Promise<void>((resolve) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.88;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export async function playSpanishSpeech(text: string, voice: VoicePreference = 'male') {
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
    await speakWithBrowser(text);
  }
}
