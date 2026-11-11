import type { CalendarReminderRequest } from './requests';
import type {
  CalendarAttendancePerson,
  CalendarEntry,
  CalendarPoll,
  CalendarReminder,
  CalendarSignUpList,
} from './schemas';

export interface CalendarReminderSource {
  target: CalendarReminderRequest;
  reminder: CalendarReminder | null;
  notAnswered: readonly CalendarAttendancePerson[] | null;
  isClosed: boolean;
}

export type ReminderAvailability = 'hidden' | 'ready' | 'waiting';

export const toReminderAvailability = (
  source: CalendarReminderSource,
  nowMs: number,
): ReminderAvailability => {
  const openCount = source.notAnswered?.length ?? 0;

  if (source.reminder === null || source.isClosed || openCount === 0) {
    return 'hidden';
  }

  const remindableFrom = source.reminder.remindableFrom;

  return remindableFrom === null || Date.parse(remindableFrom) <= nowMs ? 'ready' : 'waiting';
};

export const toAttendanceReminderSource = (entry: CalendarEntry): CalendarReminderSource | null =>
  entry.attendance === null
    ? null
    : {
        target: { calendarEntryId: entry.calendarEntryId, kind: 'attendance', addOnId: null },
        reminder: entry.attendance.reminder,
        notAnswered: entry.attendance.notAnswered,
        isClosed: entry.attendance.isClosed,
      };

export const toPollReminderSource = (
  calendarEntryId: number,
  poll: CalendarPoll,
): CalendarReminderSource => ({
  target: { calendarEntryId, kind: 'poll', addOnId: poll.pollId },
  reminder: poll.reminder,
  notAnswered: poll.notAnswered,
  isClosed: poll.isClosed,
});

export const toSignUpListReminderSource = (
  calendarEntryId: number,
  list: CalendarSignUpList,
): CalendarReminderSource => ({
  target: { calendarEntryId, kind: 'signUpList', addOnId: list.signUpListId },
  reminder: list.reminder,
  notAnswered: list.notAnswered,
  isClosed: list.isClosed,
});
