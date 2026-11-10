import { describe, expect, it } from 'vitest';
import type {
  AttendanceRoll,
  AttendanceRollName,
  AttendanceRollPerson,
} from './calendar-attendance';
import { toAttendanceRoll, toOpenGroup, toRollNames } from './calendar-attendance';
import type { CalendarAttendance } from './schemas';

const BEA_YES = {
  personId: 1,
  firstName: 'Bea',
  lastName: 'Garde',
  answer: 'yes',
  recordedByFirstName: null,
  recordedByLastName: null,
  answeredAt: '2027-01-15T12:00:00+00:00',
} as const;
const DORA_NO = {
  personId: 2,
  firstName: 'Dora',
  lastName: 'Leitung',
  answer: 'no',
  recordedByFirstName: null,
  recordedByLastName: null,
  answeredAt: '2027-01-15T12:00:00+00:00',
} as const;
const MONA_YES_BY_BEA = {
  personId: 3,
  firstName: 'Mona',
  lastName: 'Mitglied',
  answer: 'yes',
  recordedByFirstName: 'Bea',
  recordedByLastName: 'Garde',
  answeredAt: '2027-01-15T12:00:00+00:00',
} as const;
const KAI = { personId: 9, firstName: 'Kai', lastName: 'Kind' };

describe('toAttendanceRoll', () => {
  it.each<{ attendance: CalendarAttendance; expected: AttendanceRoll }>([
    {
      attendance: {
        isClosed: false,
        yes: 2,
        maybe: 0,
        no: 1,
        answers: [BEA_YES, DORA_NO, MONA_YES_BY_BEA],
        notAnswered: null,
      },
      expected: {
        isClosed: false,
        groups: [
          {
            key: 'yes',
            count: 2,
            people: [
              { personId: 1, name: 'Bea Garde', recordedBy: null },
              { personId: 3, name: 'Mona Mitglied', recordedBy: 'Bea' },
            ],
          },
          { key: 'maybe', count: 0, people: [] },
          {
            key: 'no',
            count: 1,
            people: [{ personId: 2, name: 'Dora Leitung', recordedBy: null }],
          },
        ],
      },
    },
    {
      attendance: { isClosed: true, yes: 0, maybe: 0, no: 0, answers: [], notAnswered: [KAI] },
      expected: {
        isClosed: true,
        groups: [
          { key: 'yes', count: 0, people: [] },
          { key: 'maybe', count: 0, people: [] },
          { key: 'no', count: 0, people: [] },
          { key: 'open', count: 1, people: [{ personId: 9, name: 'Kai Kind', recordedBy: null }] },
        ],
      },
    },
    {
      attendance: { isClosed: false, yes: 4, maybe: 1, no: 0, answers: null, notAnswered: null },
      expected: {
        isClosed: false,
        groups: [
          { key: 'yes', count: 4, people: [] },
          { key: 'maybe', count: 1, people: [] },
          { key: 'no', count: 0, people: [] },
        ],
      },
    },
  ])('rolls $attendance.yes/$attendance.maybe/$attendance.no', ({ attendance, expected }) => {
    expect(toAttendanceRoll(attendance)).toEqual(expected);
  });
});

describe('toRollNames', () => {
  it.each<{ people: AttendanceRollPerson[]; expected: AttendanceRollName[] }>([
    { people: [], expected: [] },
    {
      people: [
        { personId: 1, name: 'Bea Garde', recordedBy: null },
        { personId: 3, name: 'Mona Mitglied', recordedBy: 'Bea' },
      ],
      expected: [
        { key: '1', text: 'Bea Garde' },
        { key: '3', text: 'Mona Mitglied', note: '[Bea]' },
      ],
    },
  ])('names $people.length people', ({ people, expected }) => {
    expect(toRollNames(people, (recordedBy) => `[${recordedBy}]`)).toEqual(expected);
  });
});

describe('toOpenGroup', () => {
  it.each([
    { notAnswered: null, expected: [] },
    { notAnswered: [], expected: [] },
    {
      notAnswered: [{ personId: 7, firstName: 'Kai', lastName: 'Kind' }],
      expected: [
        { key: 'open', count: 1, people: [{ personId: 7, name: 'Kai Kind', recordedBy: null }] },
      ],
    },
  ])('groups $notAnswered as $expected', ({ notAnswered, expected }) => {
    expect(toOpenGroup(notAnswered)).toEqual(expected);
  });
});
