import type { KkGroupTone } from '@furria/ui';
import { toIsoDay } from '@/lib/day';
import { formatIsoDay } from '@/lib/membership-labels';

export interface CalendarInstant {
  startsAt: string;
}

export interface CalendarOrdering extends CalendarInstant {
  calendarEntryId: number;
  isRunning: boolean;
}

export interface CalendarMark extends CalendarInstant {
  tone: KkGroupTone | null;
}

export interface DayMarks {
  entryCount: number;
  tones: readonly KkGroupTone[];
}

export interface DayWindow {
  from: string;
  to: string;
}

export interface MonthGridDay {
  isoDay: string;
  dayNumber: number;
  inMonth: boolean;
  isToday: boolean;
  selected: boolean;
  entryCount: number;
  tones: readonly KkGroupTone[];
}

export interface MonthGridWeek {
  key: string;
  days: MonthGridDay[];
}

export const DAY_TONE_LIMIT = 3;

export const WEEKDAY_HEADERS = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'] as const;

const WEEKDAY_EYEBROWS = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'] as const;

const WEEKDAY_NAMES = [
  'Sonntag',
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
] as const;

const MONTH_NAMES = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
] as const;

const MONDAY_FIRST_OFFSETS = [6, 0, 1, 2, 3, 4, 5] as const;

const ISO_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAYS_IN_WEEK = 7;
const NO_MARKS: DayMarks = { entryCount: 0, tones: [] };
const OPEN_END_PREFIX = 'ab ';
const CLOCK_SUFFIX = ' Uhr';
const TIME_SPAN_SEPARATOR = ' – ';
const DAY_LABEL_SEPARATOR = ', ';
const NO_LABEL = '';

const pad = (value: number): string => String(value).padStart(2, '0');

const toCalendarDay = (isoDay: string): Date | null => {
  if (!ISO_DAY_PATTERN.test(isoDay)) {
    return null;
  }

  return new Date(
    Number(isoDay.slice(0, 4)),
    Number(isoDay.slice(5, 7)) - 1,
    Number(isoDay.slice(8, 10)),
  );
};

export const toLocalIsoDay = (isoInstant: string): string => toIsoDay(new Date(isoInstant));

export const toDayNumberLabel = (isoInstant: string): string => {
  const moment = new Date(isoInstant);

  return `${pad(moment.getDate())}.${pad(moment.getMonth() + 1)}.`;
};

export const toWeekdayEyebrow = (isoInstant: string): string =>
  WEEKDAY_EYEBROWS[new Date(isoInstant).getDay()] ?? NO_LABEL;

export const toTimeLabel = (isoInstant: string): string => {
  const moment = new Date(isoInstant);

  return `${pad(moment.getHours())}:${pad(moment.getMinutes())}`;
};

export const toTimeSpanLabel = (startsAt: string, endsAt: string | null): string => {
  const start = toTimeLabel(startsAt);

  if (endsAt === null) {
    return `${OPEN_END_PREFIX}${start}${CLOCK_SUFFIX}`;
  }
  if (toLocalIsoDay(endsAt) !== toLocalIsoDay(startsAt)) {
    return `${start}${CLOCK_SUFFIX}${TIME_SPAN_SEPARATOR}${toDayNumberLabel(endsAt)} ${toTimeLabel(endsAt)}${CLOCK_SUFFIX}`;
  }

  return `${start}${TIME_SPAN_SEPARATOR}${toTimeLabel(endsAt)}${CLOCK_SUFFIX}`;
};

export const toIsoDayLabel = (isoDay: string): string => {
  const day = toCalendarDay(isoDay);

  if (day === null) {
    return isoDay;
  }

  return `${WEEKDAY_NAMES[day.getDay()] ?? NO_LABEL}${DAY_LABEL_SEPARATOR}${formatIsoDay(isoDay)}`;
};

export const startOfMonth = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), 1);

export const shiftMonth = (cursor: Date, months: number): Date =>
  new Date(cursor.getFullYear(), cursor.getMonth() + months, 1);

export const toMonthLabel = (cursor: Date): string =>
  `${MONTH_NAMES[cursor.getMonth()] ?? NO_LABEL} ${cursor.getFullYear()}`;

const lastDayOfMonth = (cursor: Date): Date =>
  new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);

export const toMonthWindow = (cursor: Date): DayWindow => ({
  from: toIsoDay(startOfMonth(cursor)),
  to: toIsoDay(lastDayOfMonth(cursor)),
});

export const toMonthWeeks = (cursor: Date): Date[][] => {
  const first = startOfMonth(cursor);
  const lead = MONDAY_FIRST_OFFSETS[first.getDay()] ?? 0;
  const weekCount = Math.ceil((lead + lastDayOfMonth(cursor).getDate()) / DAYS_IN_WEEK);
  const weeks: Date[][] = [];

  for (let week = 0; week < weekCount; week += 1) {
    const days: Date[] = [];

    for (let column = 0; column < DAYS_IN_WEEK; column += 1) {
      days.push(
        new Date(first.getFullYear(), first.getMonth(), 1 - lead + week * DAYS_IN_WEEK + column),
      );
    }

    weeks.push(days);
  }

  return weeks;
};

const toKeptTones = (
  tones: readonly KkGroupTone[],
  tone: KkGroupTone | null,
): readonly KkGroupTone[] => {
  if (tone === null || tones.includes(tone) || tones.length >= DAY_TONE_LIMIT) {
    return tones;
  }

  return [...tones, tone];
};

export const toDayCounts = (marks: readonly CalendarMark[]): Map<string, DayMarks> => {
  const days = new Map<string, DayMarks>();

  for (const mark of marks) {
    const isoDay = toLocalIsoDay(mark.startsAt);
    const seen = days.get(isoDay) ?? NO_MARKS;

    days.set(isoDay, {
      entryCount: seen.entryCount + 1,
      tones: toKeptTones(seen.tones, mark.tone),
    });
  }

  return days;
};

export const toMonthGridWeeks = (
  cursor: Date,
  today: Date,
  marks: readonly CalendarMark[],
  selectedDay: string | null,
): MonthGridWeek[] => {
  const days = toDayCounts(marks);
  const todayIsoDay = toIsoDay(today);
  const month = cursor.getMonth();

  return toMonthWeeks(cursor).map((week) => {
    const gridDays = week.map((day) => {
      const isoDay = toIsoDay(day);
      const marked = days.get(isoDay) ?? NO_MARKS;

      return {
        isoDay,
        dayNumber: day.getDate(),
        inMonth: day.getMonth() === month,
        isToday: isoDay === todayIsoDay,
        selected: isoDay === selectedDay,
        entryCount: marked.entryCount,
        tones: marked.tones,
      };
    });

    return { key: gridDays[0]?.isoDay ?? NO_LABEL, days: gridDays };
  });
};

export const entriesOnDay = <TEntry extends CalendarInstant>(
  entries: readonly TEntry[],
  isoDay: string,
): TEntry[] => entries.filter((entry) => toLocalIsoDay(entry.startsAt) === isoDay);

export const sortRunningFirst = <TEntry extends CalendarOrdering>(
  entries: readonly TEntry[],
): TEntry[] =>
  [...entries].sort((left, right) => {
    if (left.isRunning !== right.isRunning) {
      return left.isRunning ? -1 : 1;
    }

    const byStart = Date.parse(left.startsAt) - Date.parse(right.startsAt);

    if (byStart !== 0) {
      return byStart;
    }

    return left.calendarEntryId - right.calendarEntryId;
  });
