import type { AttendanceAnswerKey } from '@/lib/calendar-copy';
import { ATTENDANCE_ANSWER_KEYS } from '@/lib/calendar-copy';
import { toPersonName } from './calendar-people';
import type { CalendarAttendance, CalendarAttendanceAnswer } from './schemas';

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
  answerCount: number;
  groups: readonly AttendanceRollGroup[];
}

const NAME_SEPARATOR = ', ';

const toRollPerson = (answer: CalendarAttendanceAnswer): AttendanceRollPerson => ({
  personId: answer.personId,
  name: toPersonName(answer),
  recordedBy: answer.recordedByFirstName,
});

export const toAttendanceRoll = (attendance: CalendarAttendance): AttendanceRoll => {
  const answers = attendance.answers ?? [];
  const answered = ATTENDANCE_ANSWER_KEYS.map((key) => ({
    key,
    count: attendance[key],
    people: answers.filter((answer) => answer.answer === key).map(toRollPerson),
  }));
  const notAnswered = attendance.notAnswered;
  const open =
    notAnswered === null
      ? []
      : [
          {
            key: 'open' as const,
            count: notAnswered.length,
            people: notAnswered.map((person) => ({
              personId: person.personId,
              name: toPersonName(person),
              recordedBy: null,
            })),
          },
        ];

  return {
    isClosed: attendance.isClosed,
    answerCount: attendance.yes + attendance.maybe + attendance.no,
    groups: [...answered, ...open],
  };
};

export const toRollNames = (
  people: readonly AttendanceRollPerson[],
  onBehalfLabel: (recordedBy: string) => string,
): string | undefined => {
  if (people.length === 0) {
    return undefined;
  }

  return people
    .map((person) =>
      person.recordedBy === null
        ? person.name
        : `${person.name} ${onBehalfLabel(person.recordedBy)}`,
    )
    .join(NAME_SEPARATOR);
};
