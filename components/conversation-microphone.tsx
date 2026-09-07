'use client';
import { useEffect, useRef, useState } from 'react';
import { Mic, Square, LoaderCircle, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConversationRecorder } from '@/lib/conversation-recorder';
import {
  MAX_RECORDING_SECONDS,
  recordingExtension,
} from '@/lib/conversation-audio';
import { stopSpanishSpeech } from '@/lib/speech';
import type { CEFRLevel } from '@/lib/cefr';
import styles from './conversation-practice.module.css';

type Props = {
  topicId: string;
  scenarioId: string;
  level: CEFRLevel;
  disabled: boolean;
  onTranscript: (text: string) => void;
  onBusyChange: (busy: boolean) => void;
  onBeforeRecord: () => void;
};
export function ConversationMicrophone(props: Props) {
  const [phase, setPhase] = useState('idle');
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [canRetry, setCanRetry] = useState(false);
  const recorder = useRef<ConversationRecorder | null>(null);
  const request = useRef<AbortController | null>(null);
  const audio = useRef<Blob | null>(null);
  const locked = useRef(false);
  const latest = useRef(props);
  useEffect(() => {
    latest.current = props;
  }, [props]);

  function updatePhase(value: string) {
    locked.current = value !== 'idle';
    setPhase(value);
    latest.current.onBusyChange(value !== 'idle');
  }
  function cancel() {
    request.current?.abort();
    request.current = null;
    recorder.current?.cancel();
    audio.current = null;
    setCanRetry(false);
    setError('');
    setNotice('');
    updatePhase('idle');
  }
  useEffect(() => {
    const hide = () => {
      if (document.visibilityState !== 'hidden') return;
      const wasBusy = locked.current;
      request.current?.abort();
      request.current = null;
      recorder.current?.cancel();
      audio.current = null;
      setCanRetry(false);
      if (wasBusy) {
        locked.current = false;
        setPhase('idle');
        latest.current.onBusyChange(false);
        setNotice(
          'Recording stopped when you left the page. Tap Speak to try again.',
        );
      }
      stopSpanishSpeech();
    };
    document.addEventListener('visibilitychange', hide);
    return () => {
      document.removeEventListener('visibilitychange', hide);
      request.current?.abort();
      recorder.current?.cancel(true);
      audio.current = null;
    };
  }, []);

  async function transcribe(blob: Blob) {
    const controller = new AbortController();
    request.current = controller;
    audio.current = blob;
    setError('');
    setNotice('');
    setCanRetry(false);
    updatePhase('transcribing');
    const form = new FormData();
    form.set('audio', blob, `reply.${recordingExtension(blob.type) ?? 'webm'}`);
    form.set('topicId', latest.current.topicId);
    form.set('scenarioId', latest.current.scenarioId);
    form.set('level', latest.current.level);
    try {
      const response = await fetch('/api/conversation/transcribe', {
        method: 'POST',
        body: form,
        signal: controller.signal,
      });
      const result = (await response.json()) as {
        text?: string;
        error?: string;
      };
      if (!response.ok || typeof result.text !== 'string')
        throw new Error(
          result.error || 'The recording could not be transcribed. Try again.',
        );
      if (controller.signal.aborted) return;
      audio.current = null;
      latest.current.onTranscript(result.text);
      setNotice('Check the transcription below, then send your reply.');
    } catch (e) {
      if (!controller.signal.aborted) {
        setError(
          e instanceof Error ? e.message : 'Transcription failed. Try again.',
        );
        setCanRetry(true);
      }
    } finally {
      if (request.current === controller) {
        request.current = null;
        updatePhase('idle');
      }
    }
  }
  function start() {
    if (locked.current || props.disabled) return;
    setError('');
    setNotice('');
    audio.current = null;
    setCanRetry(false);
    if (
      !window.isSecureContext ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setError(
        'Microphone recording is unavailable in this browser. Open this page in a current Safari, Chrome, or Edge browser and allow microphone access. You can also type your reply.',
      );
      return;
    }
    props.onBeforeRecord();
    stopSpanishSpeech();
    recorder.current = new ConversationRecorder(
      {
        state: updatePhase,
        seconds: setSeconds,
        error: setError,
        complete: (blob) => {
          void transcribe(blob);
        },
      },
      {
        getStream: () =>
          navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
            video: false,
          }),
        Recorder: MediaRecorder,
      },
    );
    void recorder.current.start();
  }
  return (
    <div className={styles.microphone}>
      <div className={styles.microphoneActions}>
        {phase === 'recording' ? (
          <Button
            type="button"
            className={styles.recordingButton}
            onClick={() => recorder.current?.stop()}
          >
            <Square />
            Stop and transcribe
          </Button>
        ) : (
          <Button
            type="button"
            className={styles.primary}
            disabled={props.disabled || phase !== 'idle'}
            onClick={start}
          >
            {phase === 'idle' ? (
              <Mic />
            ) : (
              <LoaderCircle className="animate-spin motion-reduce:animate-none" />
            )}
            {phase === 'requesting'
              ? 'Waiting for microphone…'
              : phase === 'transcribing'
                ? 'Transcribing…'
                : phase === 'finishing'
                  ? 'Finishing recording…'
                  : 'Speak'}
          </Button>
        )}
        {phase === 'recording' && (
          <output className={styles.recordingTimer}>
            Recording · {seconds}s / {MAX_RECORDING_SECONDS}s
          </output>
        )}
        {phase !== 'idle' && (
          <Button type="button" className={styles.secondary} onClick={cancel}>
            <X />
            Cancel
          </Button>
        )}
        {canRetry && (
          <>
            <Button
              type="button"
              disabled={props.disabled}
              className={styles.secondary}
              onClick={() => {
                if (audio.current && !locked.current)
                  void transcribe(audio.current);
              }}
            >
              <RotateCcw />
              Retry transcription
            </Button>
            <Button type="button" className={styles.secondary} onClick={cancel}>
              Discard recording
            </Button>
          </>
        )}
      </div>
      <p className={styles.metadata}>
        Tap Speak, then stop when you finish. Audio is sent for transcription
        and is not saved by KurtES. Recording stops after{' '}
        {MAX_RECORDING_SECONDS} seconds.
      </p>
      {notice && <output className={styles.voiceNotice}>{notice}</output>}
      {error && (
        <p role="alert" className={styles.voiceError}>
          {error}
        </p>
      )}
    </div>
  );
}
