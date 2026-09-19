export const PRACTICE_IDLE_MS = 60_000;
export const PRACTICE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
export type PracticeArea = 'vocabulary' | 'grammar' | 'conversation';
export type PracticeInterval = { start: number; end: number };

// A suspended/throttled timer cannot turn a long gap into practice time.
export function activePracticeDelta(previous: number, now: number, lastActivity: number, visible: boolean) {
  const elapsed = now - previous;
  if (!visible || elapsed <= 0 || elapsed > 2500) return 0;
  return Math.max(0, Math.min(now, lastActivity + PRACTICE_IDLE_MS) - previous);
}

export function validPracticeIntervals(value: unknown, now: number): value is PracticeInterval[] {
  return Array.isArray(value) && value.length > 0 && value.length <= 20 && value.every((item) =>
    item && Number.isSafeInteger(item.start) && Number.isSafeInteger(item.end) &&
    item.start >= now - 300_000 && item.end <= now + 5000 &&
    item.end > item.start && item.end - item.start <= 30_000,
  );
}

export function practiceHours(seconds: number) {
  if (seconds > 0 && seconds < 36) return '<0.01';
  return (Math.floor(seconds / 36) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 });
}
