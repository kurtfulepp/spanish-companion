import {
  MAX_RECORDING_BYTES,
  MAX_RECORDING_SECONDS,
  RECORDING_TYPES,
  microphoneError,
} from './conversation-audio';

type Callbacks = {
  state: (state: 'idle' | 'requesting' | 'recording' | 'finishing') => void;
  seconds: (seconds: number) => void;
  complete: (audio: Blob) => void;
  error: (message: string) => void;
};
type Environment = {
  getStream: () => Promise<MediaStream>;
  Recorder: typeof MediaRecorder;
};
export class ConversationRecorder {
  private version = 0;
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private interval: ReturnType<typeof setInterval> | null = null;
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private running = false;
  constructor(
    private callbacks: Callbacks,
    private environment: Environment,
  ) {}

  async start() {
    if (this.running) return;
    this.running = true;
    const version = ++this.version;
    this.callbacks.state('requesting');
    try {
      const stream = await this.environment.getStream();
      if (version !== this.version) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      this.stream = stream;
      const mimeType = RECORDING_TYPES.find((type) =>
        this.environment.Recorder.isTypeSupported(type),
      );
      if (!mimeType) throw new Error('No supported recording format');
      const recorder = new this.environment.Recorder(stream, {
        mimeType,
        audioBitsPerSecond: 64_000,
      });
      this.recorder = recorder;
      const chunks: Blob[] = [];
      let size = 0;
      recorder.ondataavailable = (event) => {
        if (version !== this.version || !event.data.size) return;
        size += event.data.size;
        if (size > MAX_RECORDING_BYTES) {
          this.cancel();
          this.callbacks.error(
            'The recording is too large. Try a shorter reply.',
          );
          return;
        }
        chunks.push(event.data);
      };
      recorder.onerror = () => {
        if (version === this.version) {
          this.cancel();
          this.callbacks.error(
            'Recording was interrupted. Please record again.',
          );
        }
      };
      recorder.onstop = () => {
        if (version !== this.version) return;
        const audio = new Blob(chunks, { type: recorder.mimeType || mimeType });
        this.release();
        this.running = false;
        if (audio.size < 100) {
          this.callbacks.state('idle');
          this.callbacks.error(
            'No audio was captured. Speak for a moment and try again.',
          );
          return;
        }
        this.callbacks.complete(audio);
      };
      stream.getTracks().forEach((track) => {
        track.onended = () => {
          if (version === this.version) {
            this.cancel();
            this.callbacks.error(
              'The microphone disconnected. Reconnect it and try again.',
            );
          }
        };
      });
      recorder.start(250);
      const began = Date.now();
      this.callbacks.seconds(0);
      this.callbacks.state('recording');
      this.interval = setInterval(
        () =>
          this.callbacks.seconds(
            Math.min(
              MAX_RECORDING_SECONDS,
              Math.floor((Date.now() - began) / 1000),
            ),
          ),
        250,
      );
      this.timeout = setTimeout(
        () => this.stop(),
        MAX_RECORDING_SECONDS * 1000,
      );
    } catch (error) {
      if (version !== this.version) return;
      this.cancel();
      this.callbacks.error(microphoneError(error));
    }
  }
  stop() {
    if (this.recorder?.state !== 'recording') return;
    this.callbacks.state('finishing');
    this.clearTimers();
    this.recorder.stop();
    this.stream?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
  }
  cancel(silent = false) {
    this.version += 1;
    this.release();
    this.running = false;
    if (!silent) this.callbacks.state('idle');
  }
  private clearTimers() {
    if (this.interval !== null) clearInterval(this.interval);
    if (this.timeout !== null) clearTimeout(this.timeout);
    this.interval = null;
    this.timeout = null;
  }
  private release() {
    this.clearTimers();
    if (this.recorder) {
      this.recorder.ondataavailable = null;
      this.recorder.onstop = null;
      this.recorder.onerror = null;
      if (this.recorder.state !== 'inactive') this.recorder.stop();
    }
    this.stream?.getTracks().forEach((track) => {
      track.onended = null;
      track.stop();
    });
    this.recorder = null;
    this.stream = null;
  }
}
