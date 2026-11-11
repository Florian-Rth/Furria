import { useAttendanceChoice } from '@/features/attendance/hooks/use-attendance-choice';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import { canAnswer } from '@/lib/calendar-answering';
import { toAttendanceChoiceLabel } from '@/lib/calendar-copy';
import type { AttendanceRoll } from '../calendar-attendance';
import { toAttendanceRoll } from '../calendar-attendance';
import type { CalendarReminderSource } from '../calendar-reminders';
import { toAttendanceReminderSource } from '../calendar-reminders';
import type { CalendarEntry } from '../schemas';

export interface CalendarDetailAnswer {
  label: string;
  value: AttendanceAnswer | null;
  error: string | undefined;
  disabled: boolean;
  choose: (answer: AttendanceAnswer) => void;
}

export interface CalendarDetailAttendanceControl {
  answer: CalendarDetailAnswer | null;
  roll: AttendanceRoll | null;
  reminder: CalendarReminderSource | null;
}

export const useCalendarDetailAttendance = (
  entry: CalendarEntry,
): CalendarDetailAttendanceControl => {
  const choice = useAttendanceChoice(entry);

  return {
    answer: canAnswer(entry)
      ? {
          label: toAttendanceChoiceLabel(entry.title),
          value: choice.answer,
          error: choice.failureMessage,
          disabled: choice.isInert || (entry.attendance?.isClosed ?? false),
          choose: choice.choose,
        }
      : null,
    roll: entry.attendance === null ? null : toAttendanceRoll(entry.attendance),
    reminder: toAttendanceReminderSource(entry),
  };
};
