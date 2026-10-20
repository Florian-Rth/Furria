import { toLocalIsoDay } from '@/lib/calendar-days';
import { carnivalDaysOf, SESSION_OPENING_DAY, SESSION_OPENING_MONTH } from '@/lib/club';
import { toIsoDay } from '@/lib/day';
import type { CalendarEntry } from './schemas';

export type CalendarDayMarkKey =
  | 'opening'
  | 'womensCarnivalDay'
  | 'roseMonday'
  | 'carnivalTuesday'
  | 'ashWednesday'
  | 'carnivalWeek';

export interface CalendarDayMarkOf {
  mark: 'opening' | 'carnival';
  key: CalendarDayMarkKey;
}

export interface CalendarEntryDays {
  startDay: string;
  endDay: string;
}

const NIGHT_OWL_MS = 6 * 60 * 60 * 1000;

export const toEntryDays = (
  entry: Pick<CalendarEntry, 'startsAt' | 'endsAt'>,
): CalendarEntryDays => {
  const startDay = toLocalIsoDay(entry.startsAt);

  if (entry.endsAt === null) {
    return { startDay, endDay: startDay };
  }

  const lastDay = toIsoDay(new Date(Date.parse(entry.endsAt) - NIGHT_OWL_MS));

  return { startDay, endDay: lastDay < startDay ? startDay : lastDay };
};

const sameDay = (left: Date, right: Date): boolean => toIsoDay(left) === toIsoDay(right);

const NAMED_CARNIVAL_DAYS = [
  'womensCarnivalDay',
  'roseMonday',
  'carnivalTuesday',
  'ashWednesday',
] as const;

export const dayMarkOf = (day: Date): CalendarDayMarkOf | null => {
  if (day.getMonth() + 1 === SESSION_OPENING_MONTH && day.getDate() === SESSION_OPENING_DAY) {
    return { mark: 'opening', key: 'opening' };
  }

  const carnival = carnivalDaysOf(day.getFullYear() - 1);
  const named = NAMED_CARNIVAL_DAYS.find((key) => sameDay(carnival[key], day));

  if (named !== undefined) {
    return { mark: 'carnival', key: named };
  }

  const isoDay = toIsoDay(day);

  if (toIsoDay(carnival.womensCarnivalDay) < isoDay && isoDay < toIsoDay(carnival.ashWednesday)) {
    return { mark: 'carnival', key: 'carnivalWeek' };
  }

  return null;
};
