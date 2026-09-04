const audioCache = new Map<string, string>();
let activeAudio: HTMLAudioElement | null = null;

function speakWithBrowser(text: string) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-ES';
  utterance.rate = 0.88;
  window.speechSynthesis.speak(utterance);
}

export async function playSpanishSpeech(text: string) {
  try {
    let audioUrl = audioCache.get(text);

    if (!audioUrl) {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Speech generation failed');

      audioUrl = URL.createObjectURL(await response.blob());
      audioCache.set(text, audioUrl);
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
