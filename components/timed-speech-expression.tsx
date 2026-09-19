'use client';

import { useEffect, useRef, useState } from 'react';
import { LoaderCircle, RotateCcw, Volume2 } from 'lucide-react';
import {
  getCachedSpanishSpeech,
  playCachedSpanishWord,
  playSpanishSpeech,
  type SpeechWordTiming,
  type TimedSpeechAsset,
  type VoicePreference,
} from '@/lib/speech';

type PlaybackState = 'idle' | 'playing' | 'played' | 'error';

function activeWordAt(words: SpeechWordTiming[], time: number | null) {
  if (time === null) return -1;
  return words.findIndex((word) => time >= word.start && time < word.end);
}

export function TimedSpeechExpression({
  text,
  voice = 'male',
}: {
  text: string;
  voice?: VoicePreference;
}) {
  const initialAsset = getCachedSpanishSpeech(text, voice);
  const [asset, setAsset] = useState<TimedSpeechAsset | null>(initialAsset);
  const [state, setState] = useState<PlaybackState>(
    initialAsset ? 'played' : 'idle',
  );
  const [activeWord, setActiveWord] = useState(-1);
  const assetRef = useRef(initialAsset);
  const operationRef = useRef(0);
  const hoverTimerRef = useRef<number | null>(null);
  const phrasePlayingRef = useRef(false);

  useEffect(
    () => () => {
      if (hoverTimerRef.current !== null)
        window.clearTimeout(hoverTimerRef.current);
    },
    [],
  );

  const updateTime = (time: number | null) => {
    setActiveWord(activeWordAt(assetRef.current?.words ?? [], time));
  };

  async function playExpression() {
    if (phrasePlayingRef.current) return;
    phrasePlayingRef.current = true;
    const operation = ++operationRef.current;
    setState('playing');
    try {
      await playSpanishSpeech(text, voice, {
        onAsset: (nextAsset) => {
          assetRef.current = nextAsset;
          setAsset(nextAsset);
        },
        onTime: updateTime,
      });
      if (operation === operationRef.current) setState('played');
    } catch {
      if (operation === operationRef.current) setState('error');
    } finally {
      if (operation === operationRef.current) phrasePlayingRef.current = false;
    }
  }

  async function playWord(index: number) {
    const word = assetRef.current?.words[index];
    if (!word || phrasePlayingRef.current) return;
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }

    const operation = ++operationRef.current;
    setState('playing');
    setActiveWord(index);
    try {
      await playCachedSpanishWord(text, voice, word, { onTime: updateTime });
      if (operation === operationRef.current) setState('played');
    } catch {
      if (operation === operationRef.current) setState('error');
    }
  }

  function scheduleWord(event: React.PointerEvent, index: number) {
    if (event.pointerType !== 'mouse' || phrasePlayingRef.current) return;
    if (hoverTimerRef.current !== null)
      window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = window.setTimeout(() => {
      hoverTimerRef.current = null;
      void playWord(index);
    }, 300);
  }

  function cancelScheduledWord() {
    if (hoverTimerRef.current === null) return;
    window.clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
  }

  const words = asset?.words ?? [];
  let cursor = 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          lang="es"
          className="min-w-0 text-lg font-semibold leading-snug text-[var(--brand-ink-strong)]"
        >
          {words.length
            ? words.flatMap((word, index) => {
                const before = text.slice(cursor, word.startOffset);
                cursor = word.endOffset;
                const fragments = [];
                if (before) {
                  fragments.push(<span key={`space-${index}`}>{before}</span>);
                }
                fragments.push(
                  <button
                    key={`word-${index}`}
                    type="button"
                    aria-label={`Play “${word.text}”`}
                    title={`Play “${word.text}”`}
                    onClick={() => void playWord(index)}
                    onPointerEnter={(event) => scheduleWord(event, index)}
                    onPointerLeave={cancelScheduledWord}
                    className={`-mx-0.5 rounded-[6px] px-0.5 font-inherit text-inherit transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-ink-strong)] ${activeWord === index ? 'bg-[var(--brand-yellow)] shadow-[inset_0_-1px_0_rgba(127,48,43,.12)]' : 'hover:bg-[var(--brand-cream)]'}`}
                  >
                    {text.slice(word.startOffset, word.endOffset)}
                  </button>,
                );
                if (index === words.length - 1) {
                  const after = text.slice(cursor);
                  if (after)
                    fragments.push(<span key="after-words">{after}</span>);
                }
                return fragments;
              })
            : text}
        </p>
        <button
          type="button"
          onClick={() => void playExpression()}
          disabled={state === 'playing'}
          aria-live="polite"
          className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors motion-reduce:transition-none ${state === 'playing' ? 'cursor-wait bg-[var(--brand-cream)] text-[var(--brand-ink-muted)]' : state === 'played' ? 'bg-[var(--brand-flag-gold)] text-[var(--brand-ink-strong)] hover:brightness-[.98]' : state === 'error' ? 'bg-[#fff1ed] text-[#8b4337]' : 'bg-[var(--brand-peach)] text-[var(--brand-ink)] hover:bg-[var(--brand-cream)]'} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-ink-strong)]`}
        >
          {state === 'playing' ? (
            <LoaderCircle className="size-4 motion-safe:animate-spin" />
          ) : state === 'played' ? (
            <RotateCcw className="size-4" />
          ) : (
            <Volume2 className="size-4" />
          )}
          {state === 'playing'
            ? 'Playing…'
            : state === 'played'
              ? 'Replay'
              : state === 'error'
                ? 'Try again'
                : 'Listen'}
        </button>
      </div>
      {words.length > 0 && (
        <p className="mt-2 text-xs text-[var(--brand-ink-muted)]">
          Select or hover over a word to replay it.
        </p>
      )}
    </div>
  );
}
