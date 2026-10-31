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
  toUsualSpoken,
  USUAL_TITLE,
  weekdayOf,
} from './calendar-agenda-copy';
import type { UsualSegment } from './calendar-hours';
import { hoursBadgeOf, hoursTintOf, toSegments, toUsualSegments } from './calendar-hours';
import type { CalendarEntry, UsualTraining } from './schemas';

const USUAL_BLOCK_PREFIX = 'usual-';

export interface CalendarHoursLane {
  day: KkCalendarHoursDayData;
  tint: KkCalendarHoursTint;
  placement: KkCalendarHoursPlacement;
  quiet: boolean;
}

export interface CalendarHoursWeek {
  axis: KkCalendarHoursAxis;
  lanes: CalendarHoursLane[];
  usuals: ReadonlyMap<string, UsualTraining>;
}

export interface CalendarHoursInput {
  entries: readonly CalendarEntry[];
  usuals: readonly UsualTraining[];
  mayPlan: (groupId: number) => boolean;
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

const usualIdOf = (segment: UsualSegment): string =>
  `${USUAL_BLOCK_PREFIX}${segment.usual.usualTrainingTimeId}-${segment.dayIndex}`;

const toUsualBlock = (
  segment: UsualSegment,
  input: CalendarHoursInput,
): KkCalendarHoursBlockData => {
  const { usual, span } = segment;
  const mark = markOf(usual.groupId, usual.groupTone);
  const from = toTimeLabel(usual.startsAt);

  return {
    ...span,
    id: usualIdOf(segment),
    title: USUAL_TITLE,
    time: from,
    label: toUsualSpoken(
      usual.groupName,
      from,
      toTimeLabel(usual.endsAt),
      usual.venueName,
      input.mayPlan(usual.groupId),
    ),
    kind: KIND_GLYPHS.training,
    tone: mark === 'club' ? null : mark,
    running: false,
    usual: true,
    badge: null,
    selected: false,
  };
};

export const toHoursWeek = (input: CalendarHoursInput): CalendarHoursWeek => {
  const segments = toSegments(input.entries, input.weekDays);
  const usualSegments = toUsualSegments(input.usuals, input.weekDays);
  const axis = hoursAxisOf([
    ...segments.map((segment) => segment.span),
    ...usualSegments.map((segment) => segment.span),
  ]);

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
          usual: false,
          badge,
          selected: entry.calendarEntryId === input.selectedId,
        };
      });

    const usualBlocks = usualSegments
      .filter((segment) => segment.dayIndex === dayIndex)
      .map((segment) => toUsualBlock(segment, input));

    return {
      day: toDay(isoDay, input, blocks.length),
      tint: hoursTintOf(isoDay, input.todayDay),
      placement: placeHourBlocks([...blocks, ...usualBlocks], axis),
      quiet: blocks.length === 0,
    };
  });

  return {
    axis,
    lanes,
    usuals: new Map(usualSegments.map((segment) => [usualIdOf(segment), segment.usual])),
  };
};
