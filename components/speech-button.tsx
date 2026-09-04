'use client';

import { useRef, useState } from 'react';
import { LoaderCircle, RotateCcw, Volume2 } from 'lucide-react';
import { playSpanishSpeech, type VoicePreference } from '@/lib/speech';

export function SpeechButton({ text, voice = 'male', label = 'Listen', className = '' }: { text: string; voice?: VoicePreference; label?: string; className?: string }) {
  const [state, setState] = useState<'idle' | 'playing' | 'played' | 'error'>('idle');
  const playing = useRef(false);

  async function play() {
    if (playing.current) return;
    playing.current = true;
    setState('playing');
    try {
      await playSpanishSpeech(text, voice);
      setState('played');
    } catch {
      setState('error');
    } finally {
      playing.current = false;
    }
  }

  return <button type="button" onClick={() => void play()} disabled={state === 'playing'} aria-live="polite" className={`inline-flex items-center justify-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition ${state === 'playing' ? 'cursor-wait bg-[#dcece6] text-[#52776d]' : state === 'played' ? 'bg-primary text-white hover:bg-[#245247]' : state === 'error' ? 'bg-[#fff1ed] text-[#8b4337]' : 'bg-[#eef6f2] text-primary hover:bg-[#e2f0ea]'} ${className}`}>{state === 'playing' ? <LoaderCircle className="size-4 animate-spin" /> : state === 'played' ? <RotateCcw className="size-4" /> : <Volume2 className="size-4" />}{state === 'playing' ? 'Playing…' : state === 'played' ? 'Replay' : state === 'error' ? 'Try again' : label}</button>;
}
