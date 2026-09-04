const audioCache = new Map<string, string>();
let activeAudio: HTMLAudioElement | null = null;

export type VoicePreference = 'male' | 'female';

function speakWithBrowser(text: string) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = 0.88;
  window.speechSynthesis.speak(utterance);
}

export async function playSpanishSpeech(text: string, voice: VoicePreference = 'male') {
  try {
    const cacheKey = `${voice}:${text}`;
    let audioUrl = audioCache.get(cacheKey);

    if (!audioUrl) {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice }),
      });

      if (!response.ok) throw new Error('Speech generation failed');

      audioUrl = URL.createObjectURL(await response.blob());
      audioCache.set(cacheKey, audioUrl);
    }

    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }

    activeAudio = new Audio(audioUrl);
    await activeAudio.play();
  } catch {
    speakWithBrowser(text);
  }
}
