import { apiStatusOf } from '@furria/api-client';
import { toDayNumberLabel, toLocalIsoDay, toTimeLabel } from '@/lib/calendar-days';
import { toIsoDay } from '@/lib/day';
import type {
  AddOnHost,
  CalendarAttendance,
  CalendarAttendancePerson,
  CalendarPoll,
  CalendarReminder,
  CalendarReminderTarget,
  CalendarSignUpList,
} from './schemas';

const CONFLICT_STATUS = 409;

export interface CalendarReminderSource {
  target: CalendarReminderTarget;
  reminder: CalendarReminder | null;
  notAnswered: readonly CalendarAttendancePerson[] | null;
  isClosed: boolean;
}

export type ReminderAvailability = 'hidden' | 'unreachable' | 'ready' | 'waiting';

export type RemindedAt = { kind: 'today'; time: string } | { kind: 'earlier'; day: string };

export type ReminderFailure = 'recentlyReminded' | 'failed';

export type ReminderMeta =
  | { kind: 'unreachable' }
  | { kind: 'again'; time: string }
  | { kind: 'reminded'; reminded: RemindedAt };

export const toOpenCount = (source: CalendarReminderSource): number =>
  source.notAnswered?.length ?? 0;

export const toReminderAvailability = (
  source: CalendarReminderSource,
  nowMs: number,
): ReminderAvailability => {
  if (source.reminder === null || source.isClosed || toOpenCount(source) === 0) {
    return 'hidden';
  }

  if (source.reminder.reachableCount === 0) {
    return 'unreachable';
  }

  const remindableFrom = source.reminder.remindableFrom;

  return remindableFrom === null || Date.parse(remindableFrom) <= nowMs ? 'ready' : 'waiting';
};

export const toRemindedAt = (lastRemindedAt: string | null, now: Date): RemindedAt | null => {
  if (lastRemindedAt === null) {
    return null;
  }

  return toLocalIsoDay(lastRemindedAt) === toIsoDay(now)
    ? { kind: 'today', time: toTimeLabel(lastRemindedAt) }
    : { kind: 'earlier', day: toDayNumberLabel(lastRemindedAt) };
};

export const toReminderMeta = (
  availability: ReminderAvailability,
  reminder: CalendarReminder | null,
  now: Date,
): ReminderMeta | null => {
  if (availability === 'unreachable') {
    return { kind: 'unreachable' };
  }

  const remindableFrom = reminder?.remindableFrom ?? null;
  if (availability === 'waiting' && remindableFrom !== null) {
    return { kind: 'again', time: toTimeLabel(remindableFrom) };
  }

  const reminded = toRemindedAt(reminder?.lastRemindedAt ?? null, now);

  return reminded === null ? null : { kind: 'reminded', reminded };
};

export const toReminderFailure = (error: Error): ReminderFailure =>
  apiStatusOf(error) === CONFLICT_STATUS ? 'recentlyReminded' : 'failed';

export const toAttendanceReminderSource = (
  host: AddOnHost,
  attendance: Pick<CalendarAttendance, 'reminder' | 'notAnswered' | 'isClosed'> | null,
): CalendarReminderSource | null =>
  attendance === null
    ? null
    : {
        target: { host, kind: 'attendance', addOnId: null },
        reminder: attendance.reminder,
        notAnswered: attendance.notAnswered,
        isClosed: attendance.isClosed,
      };

export const toPollReminderSource = (
  host: AddOnHost,
  poll: CalendarPoll,
): CalendarReminderSource => ({
  target: { host, kind: 'poll', addOnId: poll.pollId },
  reminder: poll.reminder,
  notAnswered: poll.notAnswered,
  isClosed: poll.isClosed,
});

export const toSignUpListReminderSource = (
  host: AddOnHost,
  list: CalendarSignUpList,
): CalendarReminderSource => ({
  target: { host, kind: 'signUpList', addOnId: list.signUpListId },
  reminder: list.reminder,
  notAnswered: list.notAnswered,
  isClosed: list.isClosed,
});
