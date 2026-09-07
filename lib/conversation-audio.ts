export const MAX_RECORDING_SECONDS = 45;
export const MAX_RECORDING_BYTES = 3 * 1024 * 1024;
export const RECORDING_TYPES = [
  'audio/webm;codecs=opus',
  'audio/mp4',
  'audio/webm',
] as const;

export function recordingExtension(type: string) {
  const mime = type.split(';')[0].trim().toLowerCase();
  return mime === 'audio/webm'
    ? 'webm'
    : mime === 'audio/mp4'
      ? 'mp4'
      : mime === 'audio/wav'
        ? 'wav'
        : null;
}

export function microphoneError(error: unknown): string {
  const name = error instanceof Error ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError')
    return 'Microphone access is blocked. Allow microphone access for this site in your browser and device settings, then try again.';
  if (name === 'NotFoundError')
    return 'No microphone was found. Connect a microphone and try again.';
  if (name === 'NotReadableError' || name === 'AbortError')
    return 'The microphone could not be opened. Close other apps using it and try again.';
  return 'Recording could not start. Try again, or type your reply.';
}
