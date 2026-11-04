const DAY_MS = 86_400_000;
const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'] as const;

const BERLIN_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Berlin',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const BERLIN_CLOCK = new Intl.DateTimeFormat('de-DE', {
  timeZone: 'Europe/Berlin',
  hour: '2-digit',
  minute: '2-digit',
});

export type BeerDayName = 'today' | 'yesterday' | 'date';

export const dayKeyOf = (at: string): string => BERLIN_DAY.format(new Date(at));

const utcOfKey = (dayKey: string): number => Date.parse(`${dayKey}T00:00:00.000Z`);

export const daysBetweenKeys = (fromKey: string, toKey: string): number =>
  Math.round((utcOfKey(toKey) - utcOfKey(fromKey)) / DAY_MS);

export const dayNameOf = (dayKey: string, todayKey: string): BeerDayName => {
  const distance = daysBetweenKeys(dayKey, todayKey);

  if (distance === 0) {
    return 'today';
  }

  return distance === 1 ? 'yesterday' : 'date';
};

export const clockOf = (at: string): string => BERLIN_CLOCK.format(new Date(at));

export const weekdayDateOf = (dayKey: string): string => {
  const date = new Date(utcOfKey(dayKey));
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');

  return `${WEEKDAYS[date.getUTCDay()]} ${day}.${month}.`;
};

export const shortDateOf = (at: string): string => weekdayDateOf(dayKeyOf(at)).slice(3);
