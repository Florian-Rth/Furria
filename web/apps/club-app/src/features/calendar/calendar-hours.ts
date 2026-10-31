import type {
  KkCalendarHoursBadge,
  KkCalendarHoursSpan,
  KkCalendarHoursTint,
} from '@furria/ui/calendar-hours-types';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import { fromIsoDay, toIsoDay } from '@/lib/day';
import { answerOf, asksForAnswer, daysBetween, isOver } from './calendar-agenda';
import { dayMarkOf, toEntryDays } from './calendar-board';
import type { CalendarEntry, UsualTraining } from './schemas';

const MINUTES_PER_DAY = 1440;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const OPEN_END_MINUTES = 60;

export interface CalendarSegment {
  entry: CalendarEntry;
  dayIndex: number;
  span: KkCalendarHoursSpan;
}

const pad = (value: number): string => String(value).padStart(2, '0');

const minutesSince = (isoDay: string, instant: string): number => {
  const moment = new Date(instant);

  return (
    daysBetween(isoDay, toIsoDay(moment)) * MINUTES_PER_DAY +
    moment.getHours() * MINUTES_PER_HOUR +
    moment.getMinutes()
  );
};

const spanOn = (
  entry: CalendarEntry,
  isoDay: string,
  startDay: string,
  endDay: string,
): KkCalendarHoursSpan => {
  const continuesBefore = isoDay !== startDay;
  const continuesAfter = isoDay !== endDay;
  const startMinute = continuesBefore ? 0 : minutesSince(isoDay, entry.startsAt);
  const edges = { continuesBefore, continuesAfter };

  if (continuesAfter) {
    return { startMinute, endMinute: MINUTES_PER_DAY, ...edges, openEnd: false };
  }
  if (entry.endsAt === null) {
    return { startMinute, endMinute: startMinute + OPEN_END_MINUTES, ...edges, openEnd: true };
  }

  return {
    startMinute,
    endMinute: Math.max(minutesSince(isoDay, entry.endsAt), startMinute),
    ...edges,
    openEnd: false,
  };
};

export const toSegments = (
  entries: readonly CalendarEntry[],
  weekDays: readonly string[],
): CalendarSegment[] =>
  entries.flatMap((entry) => {
    const { startDay, endDay } = toEntryDays(entry);

    return weekDays.flatMap((isoDay, dayIndex) =>
      startDay <= isoDay && isoDay <= endDay
        ? [{ entry, dayIndex, span: spanOn(entry, isoDay, startDay, endDay) }]
        : [],
    );
  });

export interface UsualSegment {
  usual: UsualTraining;
  dayIndex: number;
  span: KkCalendarHoursSpan;
}

export const toUsualSegments = (
  usuals: readonly UsualTraining[],
  weekDays: readonly string[],
): UsualSegment[] =>
  usuals.flatMap((usual) => {
    const dayIndex = weekDays.indexOf(toIsoDay(new Date(usual.startsAt)));

    if (dayIndex === -1) {
      return [];
    }

    const isoDay = weekDays[dayIndex] ?? '';
    const startMinute = minutesSince(isoDay, usual.startsAt);
    const endMinute = Math.min(
      Math.max(minutesSince(isoDay, usual.endsAt), startMinute),
      MINUTES_PER_DAY,
    );

    return [
      {
        usual,
        dayIndex,
        span: {
          startMinute,
          endMinute,
          continuesBefore: false,
          continuesAfter: false,
          openEnd: false,
        },
      },
    ];
  });

export const hoursBadgeOf = (
  entry: CalendarEntry,
  nowMs: number,
  pending: ReadonlyMap<number, AttendanceAnswer>,
): KkCalendarHoursBadge => {
  if (!asksForAnswer(entry)) {
    return null;
  }

  const answer = answerOf(entry, pending);

  if (answer !== null) {
    return answer;
  }

  return isOver(entry, nowMs) ? null : 'owed';
};

export const hoursTintOf = (isoDay: string, todayDay: string): KkCalendarHoursTint => {
  if (isoDay === todayDay) {
    return 'today';
  }

  return dayMarkOf(fromIsoDay(isoDay)) === null ? 'none' : 'carnival';
};

export const toClock = (minute: number): string =>
  `${pad(Math.floor(minute / MINUTES_PER_HOUR) % HOURS_PER_DAY)}:${pad(minute % MINUTES_PER_HOUR)}`;
