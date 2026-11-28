import type { AttendanceAnswer } from '@/features/attendance/schemas';
import type {
  CalendarAttendanceChange,
  CalendarEntryResponse,
  CalendarMarkablePerson,
} from './schemas';

export type MarkedAnswer = Extract<AttendanceAnswer, 'yes' | 'no'>;

export const MARKED_ANSWERS: readonly MarkedAnswer[] = ['yes', 'no'];

export interface AttendanceMarkTarget {
  calendarEntryId: number;
  personId: number;
}

export interface AttendanceMarkInput extends AttendanceMarkTarget {
  answer: MarkedAnswer;
}

export const isMarkedAnswer = (answer: AttendanceAnswer): answer is MarkedAnswer =>
  answer !== 'maybe';

const withPerson = (
  current: CalendarEntryResponse | undefined,
  personId: number,
  change: (person: CalendarMarkablePerson) => CalendarMarkablePerson,
): CalendarEntryResponse | undefined => {
  if (current === undefined) {
    return current;
  }

  const attendance = current.entry.attendance;
  if (attendance === null || attendance.markable === null) {
    return current;
  }

  return {
    entry: {
      ...current.entry,
      attendance: {
        ...attendance,
        markable: attendance.markable.map((person) =>
          person.personId === personId ? change(person) : person,
        ),
      },
    },
  };
};

const markOf = (answer: MarkedAnswer): CalendarAttendanceChange => ({
  answer,
  isRecordedOnBehalf: true,
  recordedByFirstName: null,
  recordedByLastName: null,
  recordedAt: new Date().toISOString(),
});

export const withMark = (
  current: CalendarEntryResponse | undefined,
  { personId, answer }: AttendanceMarkInput,
): CalendarEntryResponse | undefined =>
  withPerson(current, personId, (person) => ({
    ...person,
    answer,
    trail: [markOf(answer), ...person.trail],
  }));

export const withWithdrawnMark = (
  current: CalendarEntryResponse | undefined,
  { personId }: AttendanceMarkTarget,
): CalendarEntryResponse | undefined =>
  withPerson(current, personId, (person) => {
    const trail = person.trail.slice(1);

    return { ...person, answer: trail[0]?.answer ?? null, trail };
  });
