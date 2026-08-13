const GERMAN_LOCALE = 'de-DE';
const WALL_CLOCK_TIME_ZONE = 'UTC';
const APP_TIME_ZONE = 'Europe/Berlin';

const toWallClockDate = (isoDate: string): Date =>
  new Date(isoDate.includes('T') ? `${isoDate}Z` : isoDate);

const longDateFormat = new Intl.DateTimeFormat(GERMAN_LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: WALL_CLOCK_TIME_ZONE,
});

const shortDateFormat = new Intl.DateTimeFormat(GERMAN_LOCALE, {
  day: '2-digit',
  month: '2-digit',
  timeZone: WALL_CLOCK_TIME_ZONE,
});

const numericDateFormat = new Intl.DateTimeFormat(GERMAN_LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: WALL_CLOCK_TIME_ZONE,
});

const dayOfMonthFormat = new Intl.DateTimeFormat(GERMAN_LOCALE, {
  day: '2-digit',
  timeZone: WALL_CLOCK_TIME_ZONE,
});

const monthShortFormat = new Intl.DateTimeFormat(GERMAN_LOCALE, {
  month: 'short',
  timeZone: WALL_CLOCK_TIME_ZONE,
});

const clockTimeFormat = new Intl.DateTimeFormat(GERMAN_LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
  timeZone: WALL_CLOCK_TIME_ZONE,
});

const weekdayLongFormat = new Intl.DateTimeFormat(GERMAN_LOCALE, {
  weekday: 'long',
  timeZone: WALL_CLOCK_TIME_ZONE,
});

const longDateRangeFormat = new Intl.DateTimeFormat(GERMAN_LOCALE, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: WALL_CLOCK_TIME_ZONE,
});

const berlinCalendarDayFormat = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: APP_TIME_ZONE,
});

const berlinClockFormat = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
  timeZone: APP_TIME_ZONE,
});

const MONTH_ABBREVIATION_LENGTH = 3;
const DATE_PART_LENGTH = 10;
const MS_PER_DAY = 86_400_000;
const THIN_SPACES = /[\u2009\u202f]/g;

export const formatLongDate = (isoDate: string): string =>
  longDateFormat.format(toWallClockDate(isoDate));

export const formatShortDate = (isoDate: string): string =>
  shortDateFormat.format(toWallClockDate(isoDate));

export const formatNumericDate = (isoDate: string): string =>
  numericDateFormat.format(toWallClockDate(isoDate));

export const formatDayOfMonth = (isoDate: string): string =>
  dayOfMonthFormat.format(toWallClockDate(isoDate));

export const formatMonthAbbreviation = (isoDate: string): string =>
  monthShortFormat
    .format(toWallClockDate(isoDate))
    .toUpperCase()
    .slice(0, MONTH_ABBREVIATION_LENGTH);

export const formatClockTime = (isoDate: string): string =>
  clockTimeFormat.format(toWallClockDate(isoDate));

export const formatWeekdayLong = (isoDate: string): string =>
  weekdayLongFormat.format(toWallClockDate(isoDate));

export const formatLongDateRange = (fromIsoDate: string, toIsoDate: string): string =>
  longDateRangeFormat
    .formatRange(toWallClockDate(fromIsoDate), toWallClockDate(toIsoDate))
    .replace(THIN_SPACES, ' ');

export const berlinDayNumber = (value: string | Date): number => {
  const dayIso =
    value instanceof Date
      ? berlinCalendarDayFormat.format(value)
      : value.slice(0, DATE_PART_LENGTH);
  return Math.floor(Date.parse(`${dayIso}T00:00Z`) / MS_PER_DAY);
};

export const parseBerlinDateTime = (isoDate: string): Date => {
  const wallClockAsUtc = toWallClockDate(isoDate);
  const berlinViewAsUtc = Date.parse(
    `${berlinClockFormat.format(wallClockAsUtc).replace(', ', 'T')}Z`,
  );
  return new Date(wallClockAsUtc.getTime() - (berlinViewAsUtc - wallClockAsUtc.getTime()));
};

const MS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;
const ISO_SECONDS_LENGTH = 19;

const toTwoDigits = (value: number): string => String(value).padStart(2, '0');

export const formatBerlinIsoWithOffset = (isoDateTime: string): string => {
  const wallClockAsUtc = toWallClockDate(isoDateTime);
  const offsetMinutes =
    (wallClockAsUtc.getTime() - parseBerlinDateTime(isoDateTime).getTime()) / MS_PER_MINUTE;
  const sign = offsetMinutes < 0 ? '-' : '+';
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = toTwoDigits(Math.floor(absoluteMinutes / MINUTES_PER_HOUR));
  const minutes = toTwoDigits(absoluteMinutes % MINUTES_PER_HOUR);
  return `${wallClockAsUtc.toISOString().slice(0, ISO_SECONDS_LENGTH)}${sign}${hours}:${minutes}`;
};
