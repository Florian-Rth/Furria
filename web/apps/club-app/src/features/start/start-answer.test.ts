import { describe, expect, it } from 'vitest';
import type { AttendanceAnswer } from '@/features/attendance/schemas';
import type { Start, StartAttendance, StartEntry } from './schemas';
import { toHeldAnswers, withPendingAnswers } from './start-answer';

const entry = (calendarEntryId: number, attendance: StartAttendance | null): StartEntry => ({
  calendarEntryId,
  title: 'Stellprobe',
  kind: 'training',
  startsAt: '2027-01-21T17:00:00Z',
  endsAt: null,
  isRunning: false,
  venue: null,
  viewerHoldsVenueKey: false,
  ownerGroup: null,
  participatingGroups: [],
  audience: 'club',
  audienceGroups: [],
  viewerGroupIds: [],
  viewerRuns: null,
  attendance,
  openPolls: [],
  openSignUpLists: [],
  description: null,
  event: null,
});

const OWED: StartAttendance = { viewerAnswer: null, isOwed: true };
const SAID_YES: StartAttendance = { viewerAnswer: 'yes', isOwed: false };
const SAID_NO: StartAttendance = { viewerAnswer: 'no', isOwed: false };

const start = (entries: StartEntry[]): Start => ({
  asOf: '2027-01-19T18:50:00Z',
  today: '2027-01-19',
  reshapeAt: null,
  viewerIsActiveInClub: true,
  panels: [
    { kind: 'toDos', shownCount: 1, toDos: [{ kind: 'reminderDue', count: 12 }] },
    { kind: 'calendar', shownCount: entries.length, entries },
  ],
});

describe('withPendingAnswers', () => {
  it.each<{
    label: string;
    data: Start;
    pending: [number, AttendanceAnswer][];
    expected: Start;
  }>([
    {
      label: 'nothing is pending',
      data: start([entry(1, OWED)]),
      pending: [],
      expected: start([entry(1, OWED)]),
    },
    {
      label: 'she answers an owed entry',
      data: start([entry(1, OWED), entry(2, OWED)]),
      pending: [[2, 'yes']],
      expected: start([entry(1, OWED), entry(2, SAID_YES)]),
    },
    {
      label: 'she changes her answer',
      data: start([entry(1, SAID_YES)]),
      pending: [[1, 'no']],
      expected: start([entry(1, SAID_NO)]),
    },
    {
      label: 'the entry asks nothing',
      data: start([entry(1, null)]),
      pending: [[1, 'yes']],
      expected: start([entry(1, null)]),
    },
    {
      label: 'the answered entry is not on the board',
      data: start([entry(1, OWED)]),
      pending: [[7, 'maybe']],
      expected: start([entry(1, OWED)]),
    },
  ])('shows the pending answer when $label', ({ data, pending, expected }) => {
    expect(withPendingAnswers(data, new Map(pending))).toEqual(expected);
  });
});

describe('toHeldAnswers', () => {
  const fresh = start([entry(1, SAID_YES)]);
  const answers = (pairs: [number, AttendanceAnswer][]): Map<number, AttendanceAnswer> =>
    new Map(pairs);

  it.each([
    ['keeps a saved answer of an entry the fresh read dropped', [], [[2, 'no']], [[2, 'no']]],
    ['ignores a saved answer of an entry the fresh read still holds', [], [[1, 'no']], []],
    ['lets a pending answer win over a saved one', [[2, 'yes']], [[2, 'no']], [[2, 'yes']]],
    ['keeps every pending answer', [[1, 'maybe']], [], [[1, 'maybe']]],
  ] as const)('%s', (_, pending, settled, expected) => {
    const held = toHeldAnswers(
      answers(pending.map(([id, answer]) => [id, answer])),
      answers(settled.map(([id, answer]) => [id, answer])),
      fresh,
    );

    expect([...held]).toEqual(expected.map(([id, answer]) => [id, answer]));
  });
});
