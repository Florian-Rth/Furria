import type { AttendanceAnswerKey } from '@/lib/calendar-copy';
import { ATTENDANCE_ANSWER_KEYS } from '@/lib/calendar-copy';
import type { NamedPerson, NameEntry, NamesTab } from './calendar-names';
import { toOpenTab, toPersonEntry } from './calendar-names';
import type { CalendarAttendanceAnswer, WhatsAppUnassignedAnswer } from './schemas';
import type { UnassignedCopy } from './whatsapp-answers';
import { toUnassignedTab, withTabs } from './whatsapp-answers';

export type AttendanceRollKey = AttendanceAnswerKey | 'open';

export interface AttendanceRoll {
  isClosed: boolean;
  tabs: NamesTab[];
}

export interface AttendanceRollCopy {
  labels: Record<AttendanceRollKey, string>;
  onBehalf: (recordedBy: string) => string;
  throughWhatsApp: string;
  unassigned: UnassignedCopy;
}

export interface RolledAttendance {
  isClosed: boolean;
  yes: number;
  maybe: number;
  no: number;
  answers: readonly CalendarAttendanceAnswer[] | null;
  notAnswered: readonly NamedPerson[] | null;
  unassigned: readonly WhatsAppUnassignedAnswer[] | null;
}

const toAnswerNote = (
  answer: CalendarAttendanceAnswer,
  copy: AttendanceRollCopy,
): string | undefined => {
  if (answer.recordedByFirstName !== null) {
    return copy.onBehalf(answer.recordedByFirstName);
  }

  return answer.isGivenThroughWhatsApp ? copy.throughWhatsApp : undefined;
};

const toAnswerEntry = (
  answer: CalendarAttendanceAnswer,
  ownPersonId: number | null,
  copy: AttendanceRollCopy,
): NameEntry => toPersonEntry(answer, ownPersonId, toAnswerNote(answer, copy));

export const toAttendanceRoll = (
  attendance: RolledAttendance,
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
  const unassigned = toUnassignedTab(
    attendance.unassigned,
    (sender) => copy.labels[sender.answer],
    copy.unassigned,
  );

  return {
    isClosed: attendance.isClosed,
    tabs: withTabs(answered, open, unassigned),
  };
};
