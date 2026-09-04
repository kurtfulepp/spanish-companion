export const DEFAULT_LEARNING_TIME_ZONE = 'America/New_York';

const weekdayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function deviceTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_LEARNING_TIME_ZONE;
}

export function timeZoneLabel(timeZone: string) {
  if (timeZone === DEFAULT_LEARNING_TIME_ZONE) return 'New York time';
  return timeZone.split('/').at(-1)?.replaceAll('_', ' ') ?? timeZone;
}

export function dateKey(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function shiftDateKey(key: string, days: number) {
  const date = new Date(`${key}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function currentWeek(timeZone: string, now = new Date()) {
  const todayKey = dateKey(now, timeZone);
  const dayFromMonday = (new Date(`${todayKey}T12:00:00Z`).getUTCDay() + 6) % 7;
  const mondayKey = shiftDateKey(todayKey, -dayFromMonday);
  return weekdayLabels.map((label, index) => {
    const key = shiftDateKey(mondayKey, index);
    return { label, key, isToday: key === todayKey };
  });
}

export function calculateStreak(completionDates: string[], timeZone: string, now = new Date()) {
  const completed = new Set(completionDates);
  let cursor = dateKey(now, timeZone);
  if (!completed.has(cursor)) cursor = shiftDateKey(cursor, -1);
  let streak = 0;
  while (completed.has(cursor)) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
}

export function formatCompletionDate(value: string, timeZone: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}
