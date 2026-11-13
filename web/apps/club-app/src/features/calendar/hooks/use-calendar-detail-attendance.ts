import { useAttendanceChoice } from '@/features/attendance/hooks/use-attendance-choice';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import { useMeQuery } from '@/features/session/api';
import { canAnswer } from '@/lib/calendar-answering';
import {
  ATTENDANCE_ROLL_LABELS,
  toAttendanceChoiceLabel,
  toOnBehalfLabel,
} from '@/lib/calendar-copy';
import { toEntryHost } from '../add-on-host';
import type { AttendanceRoll, AttendanceRollCopy } from '../calendar-attendance';
import { toAttendanceRoll } from '../calendar-attendance';
import type { CalendarReminderSource } from '../calendar-reminders';
import { toAttendanceReminderSource } from '../calendar-reminders';
import type { CalendarEntry } from '../schemas';
import type { NamesSheetControl } from './use-names-sheet';
import { useNamesSheet } from './use-names-sheet';

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
  sheet: NamesSheetControl;
}

export const ATTENDANCE_ROLL_COPY: AttendanceRollCopy = {
  labels: ATTENDANCE_ROLL_LABELS,
  onBehalf: toOnBehalfLabel,
};

export const useCalendarDetailAttendance = (
  entry: CalendarEntry,
): CalendarDetailAttendanceControl => {
  const choice = useAttendanceChoice(entry);
  const ownPersonId = useMeQuery().data?.person?.id ?? null;
  const sheet = useNamesSheet();

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
    roll:
      entry.attendance === null
        ? null
        : toAttendanceRoll(entry.attendance, ownPersonId, ATTENDANCE_ROLL_COPY),
    reminder: toAttendanceReminderSource(toEntryHost(entry), entry.attendance),
    sheet,
  };
};
