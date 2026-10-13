import type { KkMonthBoardBarData, KkMonthBoardDayData, KkMonthBoardDayMark } from '@furria/ui';
import type { DayWindow } from '@/lib/calendar-days';
import {
  sortRunningFirst,
  toIsoDayLabel,
  toLocalIsoDay,
  toMonthWeeks,
  toTimeLabel,
} from '@/lib/calendar-days';
import { carnivalDaysOf, SESSION_OPENING_DAY, SESSION_OPENING_MONTH } from '@/lib/club';
import { toIsoDay } from '@/lib/day';
import { toDayEntriesLabel } from './calendar-labels';
import { toEntryTone } from './calendar-tones';
import type { CalendarEntry } from './schemas';

export type CalendarDayMarkKey =
  | 'opening'
  | 'womensCarnivalDay'
  | 'roseMonday'
  | 'carnivalTuesday'
  | 'ashWednesday'
  | 'carnivalWeek';

export interface CalendarDayMark {
  mark: KkMonthBoardDayMark;
  key: CalendarDayMarkKey;
}

export interface CalendarBoardWeek {
  key: string;
  open: boolean;
  days: KkMonthBoardDayData[];
}

export interface CalendarEntryDays {
  startDay: string;
  endDay: string;
}

type DayMarkLabels = Record<CalendarDayMarkKey, string | null>;

const NIGHT_OWL_MS = 6 * 60 * 60 * 1000;
const LABEL_SEPARATOR = ' · ';
const NO_ENTRIES_LABEL = 'keine Termine';
const NO_ENTRIES = 0;

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

const covers = (entry: CalendarEntry, isoDay: string): boolean => {
  const { startDay, endDay } = toEntryDays(entry);

  return startDay <= isoDay && isoDay <= endDay;
};

const awaitsAnswer = (entry: CalendarEntry, todayIsoDay: string): boolean =>
  entry.asksForResponse && entry.viewerAnswer === null && toEntryDays(entry).endDay >= todayIsoDay;

export const entriesOnBoardDay = (
  entries: readonly CalendarEntry[],
  isoDay: string,
): CalendarEntry[] => sortRunningFirst(entries.filter((entry) => covers(entry, isoDay)));

export const toBoardBars = (entries: readonly CalendarEntry[]): KkMonthBoardBarData[] =>
  entries.map((entry) => ({
    id: String(entry.calendarEntryId),
    title: entry.title,
    time: toTimeLabel(entry.startsAt),
    ...toEntryDays(entry),
    tone: toEntryTone(entry),
    running: entry.isRunning,
  }));

const sameDay = (left: Date, right: Date): boolean => toIsoDay(left) === toIsoDay(right);

const NAMED_CARNIVAL_DAYS = [
  'womensCarnivalDay',
  'roseMonday',
  'carnivalTuesday',
  'ashWednesday',
] as const;

export const dayMarkOf = (day: Date): CalendarDayMark | null => {
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

const toDayLabel = (isoDay: string, count: number): string =>
  `${toIsoDayLabel(isoDay)}${LABEL_SEPARATOR}${count === NO_ENTRIES ? NO_ENTRIES_LABEL : toDayEntriesLabel(count)}`;

export const toBoardWeeks = (
  cursor: Date,
  today: Date,
  selectedDay: string,
  entries: readonly CalendarEntry[],
  markLabels: DayMarkLabels,
): CalendarBoardWeek[] => {
  const todayIsoDay = toIsoDay(today);
  const month = cursor.getMonth();

  return toMonthWeeks(cursor).map((week) => {
    const days = week.map((day): KkMonthBoardDayData => {
      const isoDay = toIsoDay(day);
      const onDay = entries.filter((entry) => covers(entry, isoDay));
      const dayMark = dayMarkOf(day);

      return {
        isoDay,
        dayNumber: day.getDate(),
        label: toDayLabel(isoDay, onDay.length),
        inMonth: day.getMonth() === month,
        isToday: isoDay === todayIsoDay,
        selected: isoDay === selectedDay,
        awaitsAnswer: onDay.some((entry) => awaitsAnswer(entry, todayIsoDay)),
        mark: dayMark?.mark ?? null,
        markLabel: dayMark === null ? null : markLabels[dayMark.key],
      };
    });

    return {
      key: days[0]?.isoDay ?? '',
      open: days.some((day) => day.selected),
      days,
    };
  });
};

export const toBoardDay = (cursor: Date, today: Date, requested: string | null): string => {
  const weeks = toMonthWeeks(cursor);
  const shown = weeks.flat().map(toIsoDay);

  if (requested !== null && shown.includes(requested)) {
    return requested;
  }
  if (today.getFullYear() === cursor.getFullYear() && today.getMonth() === cursor.getMonth()) {
    return toIsoDay(today);
  }

  return toIsoDay(new Date(cursor.getFullYear(), cursor.getMonth(), 1));
};

export const toBoardWindow = (cursor: Date): DayWindow => {
  const shown = toMonthWeeks(cursor).flat();
  const first = shown[0] ?? cursor;
  const last = shown[shown.length - 1] ?? cursor;

  return { from: toIsoDay(first), to: toIsoDay(last) };
};
