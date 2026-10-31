import type { KkGroupTone } from '@furria/ui/group-tone';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import { toGroupTone } from '@/features/groups/group-identity';
import { sortRunningFirst, toLocalIsoDay, toTimeLabel } from '@/lib/calendar-days';
import { fromIsoDay, toIsoDay } from '@/lib/day';
import type { CalendarDayMarkKey } from './calendar-board';
import { dayMarkOf, toEntryDays } from './calendar-board';
import type { CalendarEntry, UsualTraining } from './schemas';

export const DEFAULT_REACH_DAYS = 120;
export const MAX_SPAN_DAYS = 399;

const MS_PER_DAY = 86_400_000;
const DAYS_IN_WEEK = 7;
const LANDING_TAIL_DAYS = 28;
const LATER_STEP_DAYS = 56;
const MAX_MARKS = 3;
const NEAR_DAYS = 6;

export type CalendarMark = KkGroupTone | 'club';

export interface CalendarWindow {
  from: string;
  to: string;
}

const partsOf = (isoDay: string): [number, number, number] => [
  Number(isoDay.slice(0, 4)),
  Number(isoDay.slice(5, 7)) - 1,
  Number(isoDay.slice(8, 10)),
];

export const shiftDay = (isoDay: string, days: number): string => {
  const [year, month, day] = partsOf(isoDay);

  return toIsoDay(new Date(year, month, day + days));
};

export const daysBetween = (from: string, to: string): number =>
  Math.round((Date.UTC(...partsOf(to)) - Date.UTC(...partsOf(from))) / MS_PER_DAY);

export const weekdayIndexOf = (isoDay: string): number => (fromIsoDay(isoDay).getDay() + 6) % 7;

export const mondayOf = (isoDay: string): string => shiftDay(isoDay, -weekdayIndexOf(isoDay));

export const isoWeekOf = (isoDay: string): number => {
  const thursday = shiftDay(isoDay, 3 - weekdayIndexOf(isoDay));

  return Math.floor(daysBetween(`${thursday.slice(0, 4)}-01-01`, thursday) / DAYS_IN_WEEK) + 1;
};

export const weekDaysOf = (monday: string): string[] =>
  Array.from({ length: DAYS_IN_WEEK }, (_, offset) => shiftDay(monday, offset));

export const monthDaysOf = (monthStart: string): string[] => {
  const first = mondayOf(monthStart);
  const [year, month] = partsOf(monthStart);
  const last = toIsoDay(new Date(year, month + 1, 0));
  const span = daysBetween(first, last) + 1;
  const weeks = Math.ceil(span / DAYS_IN_WEEK);

  return Array.from({ length: weeks * DAYS_IN_WEEK }, (_, offset) => shiftDay(first, offset));
};

export const monthStartOf = (isoDay: string): string => `${isoDay.slice(0, 7)}-01`;

export const shiftMonth = (monthStart: string, months: number): string => {
  const [year, month] = partsOf(monthStart);

  return toIsoDay(new Date(year, month + months, 1));
};

const clampSpan = (window: CalendarWindow): CalendarWindow =>
  daysBetween(window.from, window.to) > MAX_SPAN_DAYS
    ? { from: window.from, to: shiftDay(window.from, MAX_SPAN_DAYS) }
    : window;

export const initialWindowOf = (todayDay: string, requestedDay: string | null): CalendarWindow => {
  const reach = shiftDay(todayDay, DEFAULT_REACH_DAYS);

  if (requestedDay === null) {
    return { from: todayDay, to: reach };
  }

  const from = requestedDay < todayDay ? mondayOf(requestedDay) : todayDay;
  const to = requestedDay > reach ? shiftDay(requestedDay, LANDING_TAIL_DAYS) : reach;

  return clampSpan({ from, to });
};

export const earlierWindowOf = (window: CalendarWindow): CalendarWindow | null => {
  const from = mondayOf(shiftDay(window.from, -1));

  return daysBetween(from, window.to) > MAX_SPAN_DAYS ? null : { from, to: window.to };
};

export const laterWindowOf = (window: CalendarWindow): CalendarWindow | null => {
  const next = clampSpan({ from: window.from, to: shiftDay(window.to, LATER_STEP_DAYS) });

  return next.to === window.to ? null : next;
};

export const windowCovering = (window: CalendarWindow, isoDay: string): CalendarWindow => {
  if (isoDay < window.from) {
    return { from: mondayOf(isoDay), to: window.to };
  }
  if (isoDay > window.to) {
    return clampSpan({ from: window.from, to: shiftDay(isoDay, LANDING_TAIL_DAYS) });
  }

  return window;
};

export const fetchSpanOf = (window: CalendarWindow, peeked: CalendarWindow): CalendarWindow => {
  const from = peeked.from < window.from ? peeked.from : window.from;
  const to = peeked.to > window.to ? peeked.to : window.to;

  return daysBetween(from, to) > MAX_SPAN_DAYS ? window : { from, to };
};

export const isOver = (entry: Pick<CalendarEntry, 'startsAt' | 'endsAt'>, nowMs: number): boolean =>
  Date.parse(entry.endsAt ?? entry.startsAt) <= nowMs;

export const answerOf = (
  entry: Pick<CalendarEntry, 'calendarEntryId' | 'viewerAnswer'>,
  pending: ReadonlyMap<number, AttendanceAnswer>,
): AttendanceAnswer | null => pending.get(entry.calendarEntryId) ?? entry.viewerAnswer;

export const asksForAnswer = (
  entry: Pick<CalendarEntry, 'asksForResponse' | 'asksTheCast'>,
): boolean => entry.asksForResponse || entry.asksTheCast;

export const isOwed = (
  entry: CalendarEntry,
  nowMs: number,
  pending: ReadonlyMap<number, AttendanceAnswer>,
): boolean => asksForAnswer(entry) && answerOf(entry, pending) === null && !isOver(entry, nowMs);

export const owedIdsOf = (
  entries: readonly CalendarEntry[],
  nowMs: number,
  pending: ReadonlyMap<number, AttendanceAnswer>,
): number[] =>
  entries.filter((entry) => isOwed(entry, nowMs, pending)).map((entry) => entry.calendarEntryId);

export const markOf = (groupId: number | null, tone: KkGroupTone | null): CalendarMark =>
  groupId === null ? 'club' : toGroupTone(groupId, tone);

export interface CalendarLine {
  key: string;
  entry: CalendarEntry;
  dayIndex: number;
  dayCount: number;
}

export type CalendarLandmark = Exclude<CalendarDayMarkKey, 'carnivalWeek'>;

export interface CalendarDayMark {
  landmark: CalendarLandmark | null;
  carnival: boolean;
}

export const dayMarkAt = (isoDay: string): CalendarDayMark => {
  const mark = dayMarkOf(fromIsoDay(isoDay));

  if (mark === null) {
    return { landmark: null, carnival: false };
  }
  if (mark.key === 'carnivalWeek') {
    return { landmark: null, carnival: true };
  }

  return { landmark: mark.key, carnival: mark.mark === 'carnival' };
};

export type CalendarDayItem =
  | ({
      kind: 'day';
      key: string;
      isoDay: string;
      lines: CalendarLine[];
      usuals: UsualTraining[];
    } & CalendarDayMark)
  | { kind: 'gap'; key: string; fromDay: string; toDay: string };

export type CalendarSection = {
  kind: 'week';
  key: string;
  monday: string;
  items: CalendarDayItem[];
};

export const linesByDay = (
  entries: readonly CalendarEntry[],
  window: CalendarWindow,
): Map<string, CalendarLine[]> => {
  const byDay = new Map<string, CalendarLine[]>();

  for (const entry of sortRunningFirst(entries)) {
    const { startDay, endDay } = toEntryDays(entry);
    const dayCount = daysBetween(startDay, endDay) + 1;

    for (let dayIndex = 0; dayIndex < dayCount; dayIndex += 1) {
      const isoDay = shiftDay(startDay, dayIndex);

      if (isoDay >= window.from && isoDay <= window.to) {
        const lines = byDay.get(isoDay) ?? [];

        lines.push({ key: `${entry.calendarEntryId}-${isoDay}`, entry, dayIndex, dayCount });
        byDay.set(isoDay, lines);
      }
    }
  }

  return byDay;
};

export const usualsByDay = (
  usuals: readonly UsualTraining[],
  window: CalendarWindow,
): Map<string, UsualTraining[]> => {
  const byDay = new Map<string, UsualTraining[]>();
  const ordered = [...usuals].sort(
    (left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt),
  );

  for (const usual of ordered) {
    const isoDay = toLocalIsoDay(usual.startsAt);

    if (isoDay >= window.from && isoDay <= window.to) {
      byDay.set(isoDay, [...(byDay.get(isoDay) ?? []), usual]);
    }
  }

  return byDay;
};

export const toCalendarSections = (
  entries: readonly CalendarEntry[],
  usuals: readonly UsualTraining[],
  window: CalendarWindow,
  todayDay: string,
): CalendarSection[] => {
  const byDay = linesByDay(entries, window);
  const usualDays = usualsByDay(usuals, window);

  const sections: CalendarSection[] = [];
  const run: { items: CalendarDayItem[]; gap: { from: string; to: string } | null } = {
    items: [],
    gap: null,
  };

  const flushGap = (): void => {
    if (run.gap !== null) {
      run.items.push({
        kind: 'gap',
        key: `gap-${run.gap.from}`,
        fromDay: run.gap.from,
        toDay: run.gap.to,
      });
    }
    run.gap = null;
  };

  for (let isoDay = window.from; isoDay <= window.to; isoDay = shiftDay(isoDay, 1)) {
    if (isoDay === window.from || weekdayIndexOf(isoDay) === 0) {
      flushGap();
      run.items = [];
      sections.push({
        kind: 'week',
        key: `week-${isoDay}`,
        monday: mondayOf(isoDay),
        items: run.items,
      });
    }

    const lines = byDay.get(isoDay) ?? [];
    const dayUsuals = usualDays.get(isoDay) ?? [];
    const mark = dayMarkAt(isoDay);
    const shown =
      lines.length > 0 || dayUsuals.length > 0 || isoDay === todayDay || mark.landmark !== null;

    if (shown) {
      flushGap();
      run.items.push({
        kind: 'day',
        key: `day-${isoDay}`,
        isoDay,
        lines,
        usuals: dayUsuals,
        ...mark,
      });
    } else {
      run.gap = { from: run.gap?.from ?? isoDay, to: isoDay };
    }
  }

  flushGap();

  return sections;
};

export const sectionItemsOf = (sections: readonly CalendarSection[]): CalendarDayItem[] =>
  sections.flatMap((section) => section.items);

export const anchorKeyOf = (
  sections: readonly CalendarSection[],
  isoDay: string,
): string | null => {
  const hit = sectionItemsOf(sections).find((item) =>
    item.kind === 'day' ? item.isoDay >= isoDay : item.toDay >= isoDay,
  );

  return hit?.key ?? null;
};

export type CalendarWeekName = 'current' | 'next' | 'previous' | 'numbered';

export const weekNameOf = (monday: string, todayDay: string): CalendarWeekName => {
  const weeks = daysBetween(mondayOf(todayDay), monday) / DAYS_IN_WEEK;

  if (weeks === 0) {
    return 'current';
  }
  if (weeks === 1) {
    return 'next';
  }

  return weeks === -1 ? 'previous' : 'numbered';
};

export type CalendarRelative =
  | { kind: 'today' }
  | { kind: 'tomorrow' }
  | { kind: 'yesterday' }
  | { kind: 'ahead'; days: number }
  | { kind: 'past'; days: number };

export const relativeDayOf = (isoDay: string, todayDay: string): CalendarRelative => {
  const days = daysBetween(todayDay, isoDay);

  if (days === 0) {
    return { kind: 'today' };
  }
  if (days === 1) {
    return { kind: 'tomorrow' };
  }
  if (days === -1) {
    return { kind: 'yesterday' };
  }

  return days > 0 ? { kind: 'ahead', days } : { kind: 'past', days: -days };
};

export type CalendarDayTone = 'today' | 'near' | 'quiet' | 'past';

export const dayToneOf = (relative: CalendarRelative): CalendarDayTone => {
  if (relative.kind === 'today') {
    return 'today';
  }
  if (relative.kind === 'past' || relative.kind === 'yesterday') {
    return 'past';
  }
  if (relative.kind === 'tomorrow' || relative.days <= NEAR_DAYS) {
    return 'near';
  }

  return 'quiet';
};

export type CalendarTime =
  | { kind: 'single'; start: string; end: string | null; endDayOffset: number }
  | { kind: 'first'; start: string; dayCount: number }
  | { kind: 'continued'; end: string | null; dayIndex: number; dayCount: number };

export const toCalendarTime = (line: CalendarLine): CalendarTime => {
  const { entry, dayIndex, dayCount } = line;

  if (dayIndex > 0) {
    const last = dayIndex === dayCount - 1;

    return {
      kind: 'continued',
      end: last && entry.endsAt !== null ? toTimeLabel(entry.endsAt) : null,
      dayIndex,
      dayCount,
    };
  }

  const start = toTimeLabel(entry.startsAt);

  if (dayCount > 1) {
    return { kind: 'first', start, dayCount };
  }
  if (entry.endsAt === null) {
    return { kind: 'single', start, end: null, endDayOffset: 0 };
  }

  return {
    kind: 'single',
    start,
    end: toTimeLabel(entry.endsAt),
    endDayOffset: daysBetween(toLocalIsoDay(entry.startsAt), toLocalIsoDay(entry.endsAt)),
  };
};

export interface CalendarDayCell {
  isoDay: string;
  dayNumber: number;
  weekdayIndex: number;
  isToday: boolean;
  isPast: boolean;
  inMonth: boolean;
  marks: CalendarMark[];
  usualMarks: CalendarMark[];
  count: number;
  owed: boolean;
  landmark: CalendarLandmark | null;
  carnival: boolean;
}

export const toDayCells = (
  days: readonly string[],
  byDay: ReadonlyMap<string, readonly CalendarLine[]>,
  usualDays: ReadonlyMap<string, readonly UsualTraining[]>,
  owedIds: ReadonlySet<number>,
  todayDay: string,
  monthStart: string | null,
): CalendarDayCell[] =>
  days.map((isoDay) => {
    const lines = byDay.get(isoDay) ?? [];
    const usuals = usualDays.get(isoDay) ?? [];
    const mark = dayMarkAt(isoDay);
    const marks = lines
      .slice(0, MAX_MARKS)
      .map((line) => markOf(line.entry.ownerGroupId, line.entry.ownerGroupTone));

    return {
      isoDay,
      dayNumber: Number(isoDay.slice(8, 10)),
      weekdayIndex: weekdayIndexOf(isoDay),
      isToday: isoDay === todayDay,
      isPast: isoDay < todayDay,
      inMonth: monthStart === null || isoDay.slice(0, 7) === monthStart.slice(0, 7),
      marks,
      usualMarks: usuals
        .slice(0, MAX_MARKS - marks.length)
        .map((usual) => markOf(usual.groupId, usual.groupTone)),
      count: lines.length,
      owed: lines.some((line) => owedIds.has(line.entry.calendarEntryId)),
      ...mark,
    };
  });

export interface CalendarGroupTag {
  key: string;
  groupId: number | null;
  name: string | null;
  mark: CalendarMark;
}

export const groupTagsOf = (entry: CalendarEntry): CalendarGroupTag[] => [
  {
    key: `owner-${entry.ownerGroupId ?? 'club'}`,
    groupId: entry.ownerGroupId,
    name: entry.ownerGroupName,
    mark: markOf(entry.ownerGroupId, entry.ownerGroupTone),
  },
  ...entry.participatingGroups
    .filter((group) => group.groupId !== entry.ownerGroupId)
    .map((group) => ({
      key: `with-${group.groupId}`,
      groupId: group.groupId,
      name: group.name,
      mark: markOf(group.groupId, group.tone),
    })),
];

export const leadEntryOf = (
  entries: readonly CalendarEntry[],
  nowMs: number,
  fromDay: string | null,
): CalendarEntry | null =>
  sortRunningFirst(entries).find((entry) =>
    fromDay === null
      ? entry.isRunning || !isOver(entry, nowMs)
      : toEntryDays(entry).endDay >= fromDay,
  ) ?? null;

export const isPastLine = (line: CalendarLine, nowMs: number): boolean =>
  !line.entry.isRunning && isOver(line.entry, nowMs);
