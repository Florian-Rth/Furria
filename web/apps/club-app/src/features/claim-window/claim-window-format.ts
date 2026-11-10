import { toIsoDay } from '@/lib/day';

const CLUB_TIME_ZONE = 'Europe/Berlin';
const LATE_EVENING = '23:59';

const MOMENT_FORMAT = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: CLUB_TIME_ZONE,
});

const twoDigits = (value: number): string => String(value).padStart(2, '0');

export interface WindowEndFields {
  day: string;
  time: string;
}

const partOf = (parts: readonly Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) =>
  parts.find((part) => part.type === type)?.value ?? '';

export const formatWindowMoment = (at: string): string => {
  const parts = MOMENT_FORMAT.formatToParts(new Date(at));
  const weekday = partOf(parts, 'weekday').replace('.', '');

  return `${weekday}., ${partOf(parts, 'day')}.${partOf(parts, 'month')}., ${partOf(parts, 'hour')}:${partOf(parts, 'minute')} Uhr`;
};

export const windowEndFieldsOf = (closesAt: string | null, now: Date): WindowEndFields => {
  if (closesAt === null) {
    return { day: toIsoDay(now), time: LATE_EVENING };
  }
  const end = new Date(closesAt);

  return {
    day: toIsoDay(end),
    time: `${twoDigits(end.getHours())}:${twoDigits(end.getMinutes())}`,
  };
};

export const closesAtOf = ({ day, time }: WindowEndFields): string =>
  new Date(`${day}T${time}:00`).toISOString();
