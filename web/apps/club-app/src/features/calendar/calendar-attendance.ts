import type { AttendanceAnswerKey } from '@/lib/calendar-copy';
import { ATTENDANCE_ANSWER_KEYS } from '@/lib/calendar-copy';
import { toPersonName } from './calendar-people';
import type {
  CalendarAttendance,
  CalendarAttendanceAnswer,
  CalendarAttendancePerson,
} from './schemas';

export type AttendanceRollKey = AttendanceAnswerKey | 'open';

export interface AttendanceRollPerson {
  personId: number;
  name: string;
  recordedBy: string | null;
}

export interface AttendanceRollGroup {
  key: AttendanceRollKey;
  count: number;
  people: readonly AttendanceRollPerson[];
}

export interface AttendanceRoll {
  isClosed: boolean;
  groups: readonly AttendanceRollGroup[];
}

export interface AttendanceRollName {
  key: string;
  text: string;
  note?: string;
}

const toAnsweredPerson = (answer: CalendarAttendanceAnswer): AttendanceRollPerson => ({
  personId: answer.personId,
  name: toPersonName(answer),
  recordedBy: answer.recordedByFirstName,
});

const toOpenPerson = (person: CalendarAttendancePerson): AttendanceRollPerson => ({
  personId: person.personId,
  name: toPersonName(person),
  recordedBy: null,
});

export const toOpenGroup = (
  notAnswered: readonly CalendarAttendancePerson[] | null,
): AttendanceRollGroup[] =>
  notAnswered === null || notAnswered.length === 0
    ? []
    : [{ key: 'open', count: notAnswered.length, people: notAnswered.map(toOpenPerson) }];

export const toAttendanceRoll = (attendance: CalendarAttendance): AttendanceRoll => {
  const answers = attendance.answers ?? [];
  const answered = ATTENDANCE_ANSWER_KEYS.map(
    (key): AttendanceRollGroup => ({
      key,
      count: attendance[key],
      people: answers.filter((answer) => answer.answer === key).map(toAnsweredPerson),
    }),
  );

  return {
    isClosed: attendance.isClosed,
    groups: [...answered, ...toOpenGroup(attendance.notAnswered)],
  };
};

export const toRollNames = (
  people: readonly AttendanceRollPerson[],
  onBehalfLabel: (recordedBy: string) => string,
): AttendanceRollName[] =>
  people.map((person) =>
    person.recordedBy === null
      ? { key: String(person.personId), text: person.name }
      : {
          key: String(person.personId),
          text: person.name,
          note: onBehalfLabel(person.recordedBy),
        },
  );
