import { hoursAxisOf, placeHourBlocks } from '@furria/ui/calendar-hours-geometry';
import type {
  KkCalendarHoursAxis,
  KkCalendarHoursBlockData,
  KkCalendarHoursDayData,
  KkCalendarHoursPlacement,
  KkCalendarHoursTint,
} from '@furria/ui/calendar-hours-types';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import { toTimeLabel, toTimeSpanLabel } from '@/lib/calendar-days';
import { dayMarkAt, markOf } from './calendar-agenda';
import {
  KIND_GLYPHS,
  LANDMARK_LABELS,
  toBlockSpoken,
  toGroupName,
  toHoursDayLabel,
  weekdayOf,
} from './calendar-agenda-copy';
import { hoursBadgeOf, hoursTintOf, toSegments } from './calendar-hours';
import type { CalendarEntry } from './schemas';

export interface CalendarHoursLane {
  day: KkCalendarHoursDayData;
  tint: KkCalendarHoursTint;
  placement: KkCalendarHoursPlacement;
  quiet: boolean;
}

export interface CalendarHoursWeek {
  axis: KkCalendarHoursAxis;
  lanes: CalendarHoursLane[];
}

export interface CalendarHoursInput {
  entries: readonly CalendarEntry[];
  weekDays: readonly string[];
  todayDay: string;
  activeDay: string | null;
  selectedId: number | null;
  nowMs: number;
  pending: ReadonlyMap<number, AttendanceAnswer>;
}

const toDay = (
  isoDay: string,
  input: CalendarHoursInput,
  count: number,
): KkCalendarHoursDayData => {
  const { landmark } = dayMarkAt(isoDay);

  return {
    isoDay,
    weekday: weekdayOf(isoDay),
    dateLabel: `${Number(isoDay.slice(8, 10))}.`,
    label: toHoursDayLabel(isoDay, count),
    isToday: isoDay === input.todayDay,
    selected: isoDay === input.activeDay,
    mark: landmark === null ? null : landmark === 'opening' ? 'opening' : 'carnival',
    markLabel: landmark === null ? null : LANDMARK_LABELS[landmark],
  };
};

export const toHoursWeek = (input: CalendarHoursInput): CalendarHoursWeek => {
  const segments = toSegments(input.entries, input.weekDays);
  const axis = hoursAxisOf(segments.map((segment) => segment.span));

  const lanes = input.weekDays.map((isoDay, dayIndex): CalendarHoursLane => {
    const blocks = segments
      .filter((segment) => segment.dayIndex === dayIndex)
      .map(({ entry, span }): KkCalendarHoursBlockData => {
        const badge = hoursBadgeOf(entry, input.nowMs, input.pending);
        const mark = markOf(entry.ownerGroupId, entry.ownerGroupTone);

        return {
          ...span,
          id: String(entry.calendarEntryId),
          title: entry.title,
          time: span.continuesBefore ? '' : toTimeLabel(entry.startsAt),
          label: toBlockSpoken(
            entry.title,
            toTimeSpanLabel(entry.startsAt, entry.endsAt),
            toGroupName(entry.ownerGroupName),
            entry.isRunning,
            badge === 'owed',
          ),
          kind: KIND_GLYPHS[entry.kind],
          tone: mark === 'club' ? null : mark,
          running: entry.isRunning,
          badge,
          selected: entry.calendarEntryId === input.selectedId,
        };
      });

    return {
      day: toDay(isoDay, input, blocks.length),
      tint: hoursTintOf(isoDay, input.todayDay),
      placement: placeHourBlocks(blocks, axis),
      quiet: blocks.length === 0,
    };
  });

  return { axis, lanes };
};
