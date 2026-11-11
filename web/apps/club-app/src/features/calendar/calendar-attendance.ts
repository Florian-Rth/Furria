import type { AttendanceAnswerKey } from '@/lib/calendar-copy';
import { ATTENDANCE_ANSWER_KEYS } from '@/lib/calendar-copy';
import type { NameEntry, NamesTab } from './calendar-names';
import { toOpenTab, toPersonEntry } from './calendar-names';
import type { CalendarAttendance, CalendarAttendanceAnswer } from './schemas';

export type AttendanceRollKey = AttendanceAnswerKey | 'open';

export interface AttendanceRoll {
  isClosed: boolean;
  tabs: NamesTab[];
}

export interface AttendanceRollCopy {
  labels: Record<AttendanceRollKey, string>;
  onBehalf: (recordedBy: string) => string;
}

const toAnswerEntry = (
  answer: CalendarAttendanceAnswer,
  ownPersonId: number | null,
  copy: AttendanceRollCopy,
): NameEntry =>
  toPersonEntry(
    answer,
    ownPersonId,
    answer.recordedByFirstName === null ? undefined : copy.onBehalf(answer.recordedByFirstName),
  );

export const toAttendanceRoll = (
  attendance: CalendarAttendance,
  ownPersonId: number | null,
  copy: AttendanceRollCopy,
): AttendanceRoll => {
  const answers = attendance.answers;
  const answered = ATTENDANCE_ANSWER_KEYS.map(
    (key): NamesTab => ({
      id: key,
      label: copy.labels[key],
      count: attendance[key],
      tone: key,
      entries:
        answers === null
          ? null
          : answers
              .filter((answer) => answer.answer === key)
              .map((answer) => toAnswerEntry(answer, ownPersonId, copy)),
    }),
  );
  const open = toOpenTab(attendance.notAnswered, ownPersonId, copy.labels.open);

  return {
    isClosed: attendance.isClosed,
    tabs: open === null ? answered : [...answered, open],
  };
};
