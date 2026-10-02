export type IsoDay = string;

export interface Moment {
  readonly now: Date;
  readonly today: IsoDay;
}

const TIME_ZONE = 'Europe/Berlin';
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const DAYS_PER_WEEK = 7;
const LEAP_DAY = '02-29';
const LEAP_DAY_STAND_IN = '02-28';

const WALL_CLOCK = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const wallClockAsUtcMs = (instantMs: number): number => {
  const parts = new Map(
    WALL_CLOCK.formatToParts(new Date(instantMs)).map((part) => [part.type, Number(part.value)]),
  );
  return Date.UTC(
    parts.get('year') ?? 0,
    (parts.get('month') ?? 1) - 1,
    parts.get('day') ?? 1,
    parts.get('hour') ?? 0,
    parts.get('minute') ?? 0,
    parts.get('second') ?? 0,
  );
};

const berlinOffsetMs = (instantMs: number): number =>
  wallClockAsUtcMs(instantMs) - Math.floor(instantMs / MS_PER_SECOND) * MS_PER_SECOND;

const splitDay = (day: IsoDay): [number, number, number] => {
  const [year = 0, month = 1, date = 1] = day.split('-').map(Number);
  return [year, month, date];
};

const weekdayOf = (day: IsoDay): number => new Date(`${day}T00:00:00Z`).getUTCDay();

export const dayOf = (instant: Date): IsoDay =>
  new Date(wallClockAsUtcMs(instant.getTime())).toISOString().slice(0, 10);

export const momentOf = (now: Date): Moment => ({ now, today: dayOf(now) });

export const addDays = (day: IsoDay, days: number): IsoDay => {
  const [year, month, date] = splitDay(day);
  return new Date(Date.UTC(year, month - 1, date + days)).toISOString().slice(0, 10);
};

export const berlinInstant = (day: IsoDay, time: string): Date => {
  const [year, month, date] = splitDay(day);
  const [hour = 0, minute = 0] = time.split(':').map(Number);
  const wallMs = Date.UTC(year, month - 1, date, hour, minute);
  const firstGuess = wallMs - berlinOffsetMs(wallMs);
  return new Date(wallMs - berlinOffsetMs(firstGuess));
};

export const nextWeekday = (today: IsoDay, weekday: number): IsoDay =>
  addDays(today, (weekday - weekdayOf(today) + DAYS_PER_WEEK) % DAYS_PER_WEEK || DAYS_PER_WEEK);

export const nextMonthDay = (today: IsoDay, monthDay: string): IsoDay => {
  const year = Number(today.slice(0, 4));
  const thisYear = `${year}-${monthDay}`;
  return thisYear >= today ? thisYear : `${year + 1}-${monthDay}`;
};

export const birthdayToday = (today: IsoDay, birthYear: number): IsoDay => {
  const monthDay = today.slice(5);
  return `${birthYear}-${monthDay === LEAP_DAY ? LEAP_DAY_STAND_IN : monthDay}`;
};

export const minutesAfter = (instant: Date, minutes: number): Date =>
  new Date(instant.getTime() + minutes * MS_PER_MINUTE);

export const hoursAfter = (instant: Date, hours: number): Date =>
  new Date(instant.getTime() + hours * MS_PER_HOUR);

export const daysAfter = (instant: Date, days: number): Date =>
  new Date(instant.getTime() + days * MS_PER_DAY);

export const floorToMinutes = (instant: Date, minutes: number): Date => {
  const slotMs = minutes * MS_PER_MINUTE;
  return new Date(Math.floor(instant.getTime() / slotMs) * slotMs);
};
