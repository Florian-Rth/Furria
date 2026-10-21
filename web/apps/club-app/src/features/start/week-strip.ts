import type { KkWeekStripMarkState } from '@furria/ui';
import type { CalendarKindKey } from '@/lib/calendar-copy';
import { toLocalIsoDay, toTimeLabel } from '@/lib/calendar-days';
import { toIsoDay } from '@/lib/day';
import type { StartEntry } from './schemas';
import { isEntryRunningAt } from './start-labels';

export type StripSlot = 'today' | 'tomorrow' | 'week' | 'later';

export interface StripMark {
  calendarEntryId: number;
  kind: CalendarKindKey;
  state: KkWeekStripMarkState;
  time: string;
  title: string;
}

export interface StripDay {
  key: string;
  isoDay: string | null;
  slot: StripSlot;
  dayIndex: number;
  marks: StripMark[];
  shown: StripMark[];
  overflow: number;
  jumpTo: string | null;
}

export interface EntryDay {
  isoDay: string;
  slot: StripSlot;
  entries: StartEntry[];
}

export const WEEK_DAYS = 7;
export const LATER_KEY = 'later';
const MARK_ROOM = 2;

const isoDayAfter = (today: string, days: number): string => {
  const [year, month, day] = today.split('-').map(Number);

  return toIsoDay(new Date(year ?? 0, (month ?? 1) - 1, (day ?? 1) + days));
};

export const dayOfEntry = (entry: StartEntry, today: string): string => {
  const day = toLocalIsoDay(entry.startsAt);

  return day < today ? today : day;
};

export const slotOf = (isoDay: string, today: string): StripSlot => {
  if (isoDay <= today) {
    return 'today';
  }
  if (isoDay === isoDayAfter(today, 1)) {
    return 'tomorrow';
  }

  return isoDay < isoDayAfter(today, WEEK_DAYS) ? 'week' : 'later';
};

export const markStateOf = (entry: StartEntry, now: Date): KkWeekStripMarkState => {
  if (isEntryRunningAt(entry, now)) {
    return 'live';
  }

  const attendance = entry.attendance;

  if (attendance === null) {
    return 'plain';
  }
  if (attendance.viewerAnswer === 'yes' || attendance.viewerAnswer === 'maybe') {
    return 'answered';
  }

  return attendance.viewerAnswer === null && attendance.isOwed ? 'owed' : 'plain';
};

const markOf =
  (now: Date) =>
  (entry: StartEntry): StripMark => ({
    calendarEntryId: entry.calendarEntryId,
    kind: entry.kind,
    state: markStateOf(entry, now),
    time: toTimeLabel(entry.startsAt),
    title: entry.title,
  });

export const shownMarksOf = (
  marks: readonly StripMark[],
): { shown: StripMark[]; overflow: number } => {
  if (marks.length <= MARK_ROOM) {
    return { shown: [...marks], overflow: 0 };
  }

  return { shown: marks.slice(0, MARK_ROOM), overflow: marks.length - MARK_ROOM };
};

const byStart = (first: StartEntry, second: StartEntry): number =>
  Date.parse(first.startsAt) - Date.parse(second.startsAt) ||
  first.calendarEntryId - second.calendarEntryId;

export const toEntryDays = (entries: readonly StartEntry[], today: string): EntryDay[] => {
  const days = new Map<string, StartEntry[]>();

  for (const entry of entries) {
    const isoDay = dayOfEntry(entry, today);
    days.set(isoDay, [...(days.get(isoDay) ?? []), entry]);
  }

  return [...days.entries()]
    .sort(([first], [second]) => first.localeCompare(second))
    .map(([isoDay, dayEntries]) => ({
      isoDay,
      slot: slotOf(isoDay, today),
      entries: dayEntries,
    }));
};

export const toStripDays = (
  entries: readonly StartEntry[],
  today: string,
  now: Date,
): StripDay[] => {
  const agenda = toEntryDays(entries, today);
  const marksOn = (isoDay: string): StripMark[] =>
    [...(agenda.find((day) => day.isoDay === isoDay)?.entries ?? [])]
      .sort(byStart)
      .map(markOf(now));

  const week = Array.from({ length: WEEK_DAYS }, (_, dayIndex): StripDay => {
    const isoDay = isoDayAfter(today, dayIndex);
    const marks = marksOn(isoDay);

    return {
      key: isoDay,
      isoDay,
      slot: slotOf(isoDay, today),
      dayIndex,
      marks,
      ...shownMarksOf(marks),
      jumpTo: marks.length > 0 ? isoDay : null,
    };
  });

  const laterDays = agenda.filter((day) => day.slot === 'later');
  const laterMarks = laterDays.flatMap((day) => [...day.entries].sort(byStart).map(markOf(now)));

  return [
    ...week,
    {
      key: LATER_KEY,
      isoDay: null,
      slot: 'later',
      dayIndex: WEEK_DAYS,
      marks: laterMarks,
      ...shownMarksOf(laterMarks),
      jumpTo: laterDays[0]?.isoDay ?? null,
    },
  ];
};

export interface DayRun<TRow> {
  isoDay: string;
  rows: TRow[];
}

export const toDayRuns = <TRow extends { entry: StartEntry }>(
  rows: readonly TRow[],
  today: string,
): DayRun<TRow>[] => {
  const runs: DayRun<TRow>[] = [];

  for (const row of rows) {
    const isoDay = dayOfEntry(row.entry, today);
    const last = runs.at(-1);

    if (last?.isoDay === isoDay) {
      last.rows.push(row);
    } else {
      runs.push({ isoDay, rows: [row] });
    }
  }

  return runs;
};
