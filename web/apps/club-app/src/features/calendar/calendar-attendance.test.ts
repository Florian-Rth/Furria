import { describe, expect, it } from 'vitest';
import type { AttendanceRoll, AttendanceRollCopy } from './calendar-attendance';
import { toAttendanceRoll } from './calendar-attendance';
import type { CalendarAttendance } from './schemas';

const COPY: AttendanceRollCopy = {
  labels: { yes: 'yes', maybe: 'maybe', no: 'no', open: 'open' },
  onBehalf: (recordedBy) => `[${recordedBy}]`,
};
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
  it.each<{ attendance: CalendarAttendance; ownPersonId: number | null; expected: AttendanceRoll }>(
    [
      {
        attendance: {
          isClosed: false,
          yes: 2,
          maybe: 0,
          no: 1,
          answers: [BEA_YES, DORA_NO, MONA_YES_BY_BEA],
          notAnswered: null,
          reminder: null,
        },
        ownPersonId: 1,
        expected: {
          isClosed: false,
          tabs: [
            {
              id: 'yes',
              label: 'yes',
              count: 2,
              tone: 'yes',
              entries: [
                { key: '1', name: 'Bea Garde', isOwn: true },
                { key: '3', name: 'Mona Mitglied', isOwn: false, note: '[Bea]' },
              ],
            },
            { id: 'maybe', label: 'maybe', count: 0, tone: 'maybe', entries: [] },
            {
              id: 'no',
              label: 'no',
              count: 1,
              tone: 'no',
              entries: [{ key: '2', name: 'Dora Leitung', isOwn: false }],
            },
          ],
        },
      },
      {
        attendance: {
          isClosed: true,
          yes: 0,
          maybe: 0,
          no: 0,
          answers: [],
          notAnswered: [KAI],
          reminder: null,
        },
        ownPersonId: null,
        expected: {
          isClosed: true,
          tabs: [
            { id: 'yes', label: 'yes', count: 0, tone: 'yes', entries: [] },
            { id: 'maybe', label: 'maybe', count: 0, tone: 'maybe', entries: [] },
            { id: 'no', label: 'no', count: 0, tone: 'no', entries: [] },
            {
              id: 'open',
              label: 'open',
              count: 1,
              tone: 'open',
              entries: [{ key: '9', name: 'Kai Kind', isOwn: false }],
            },
          ],
        },
      },
      {
        attendance: {
          isClosed: false,
          yes: 4,
          maybe: 1,
          no: 0,
          answers: null,
          notAnswered: null,
          reminder: null,
        },
        ownPersonId: 1,
        expected: {
          isClosed: false,
          tabs: [
            { id: 'yes', label: 'yes', count: 4, tone: 'yes', entries: null },
            { id: 'maybe', label: 'maybe', count: 1, tone: 'maybe', entries: null },
            { id: 'no', label: 'no', count: 0, tone: 'no', entries: null },
          ],
        },
      },
    ],
  )(
    'rolls $attendance.yes/$attendance.maybe/$attendance.no',
    ({ attendance, ownPersonId, expected }) => {
      expect(toAttendanceRoll(attendance, ownPersonId, COPY)).toEqual(expected);
    },
  );
});
