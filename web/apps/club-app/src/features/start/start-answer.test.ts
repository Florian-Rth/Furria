import { describe, expect, it } from 'vitest';
import {
  RequestBlockedError,
  RequestFailedError,
  ServerFailureError,
  UnauthorizedError,
} from '@/lib/api/api-error';
import type { Start, StartAttendance, StartEntry } from './schemas';
import type { StartAnswerAttempt, StartAnswerFailure } from './start-answer';
import {
  attendanceOf,
  latestAnswerErrorOf,
  OfflineAnswerError,
  toAnswerFailureOf,
  toAnswerRollbackOf,
  withEntryAttendance,
} from './start-answer';

const entry = (calendarEntryId: number, attendance: StartAttendance | null): StartEntry => ({
  calendarEntryId,
  title: 'Stellprobe',
  kind: 'rehearsal',
  startsAt: '2027-01-21T17:00:00Z',
  endsAt: null,
  isRunning: false,
  venue: null,
  viewerHoldsVenueKey: false,
  ownerGroup: null,
  participatingGroups: [],
  viewerGroupIds: [],
  viewerRuns: null,
  attendance,
  description: null,
});

const OWED: StartAttendance = { viewerAnswer: null, isOwed: true };
const ANSWERED: StartAttendance = { viewerAnswer: 'yes', isOwed: false };

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

describe('toAnswerFailureOf', () => {
  it.each<{ label: string; error: Error | null; expected: StartAnswerFailure | null }>([
    { label: 'nothing failed', error: null, expected: null },
    { label: 'the device was offline', error: new OfflineAnswerError(), expected: 'offline' },
    { label: 'the request never arrived', error: new RequestBlockedError(), expected: 'unsaved' },
    { label: 'the server broke', error: new ServerFailureError(500), expected: 'unsaved' },
    { label: 'the server was busy', error: new ServerFailureError(503), expected: 'unsaved' },
    { label: 'the session expired', error: new UnauthorizedError(), expected: 'unsaved' },
    { label: 'the entry was deleted', error: new ServerFailureError(404), expected: 'gone' },
    { label: 'the entry is no longer hers', error: new ServerFailureError(403), expected: 'gone' },
    {
      label: 'the entry stopped asking',
      error: new RequestFailedError(400, [{ field: 'answer', message: 'Keine Antwort erbeten.' }]),
      expected: 'notAsked',
    },
    {
      label: 'the entry stopped asking without details',
      error: new ServerFailureError(400),
      expected: 'notAsked',
    },
    { label: 'the answer collided', error: new RequestFailedError(409, []), expected: 'conflict' },
  ])('is $expected when $label', ({ error, expected }) => {
    expect(toAnswerFailureOf(error)).toBe(expected);
  });
});

describe('attendanceOf', () => {
  it.each<{
    label: string;
    data: Start | undefined;
    expected: StartAttendance | null | undefined;
  }>([
    { label: 'nothing is cached', data: undefined, expected: undefined },
    { label: 'the entry is not on the board', data: start([entry(1, OWED)]), expected: undefined },
    {
      label: 'the entry asks nothing',
      data: start([entry(1, OWED), entry(2, null)]),
      expected: null,
    },
    {
      label: 'the entry is owed',
      data: start([entry(1, ANSWERED), entry(2, OWED)]),
      expected: OWED,
    },
  ])('reads $expected when $label', ({ data, expected }) => {
    expect(attendanceOf(data, 2)).toEqual(expected);
  });
});

describe('withEntryAttendance', () => {
  it.each([
    {
      label: 'she answers the owed entry',
      data: start([entry(1, OWED), entry(2, OWED)]),
      attendance: ANSWERED,
      expected: start([entry(1, OWED), entry(2, ANSWERED)]),
    },
    {
      label: 'her answer is rolled back',
      data: start([entry(2, ANSWERED)]),
      attendance: OWED,
      expected: start([entry(2, OWED)]),
    },
    {
      label: 'the entry is not on the board',
      data: start([entry(1, OWED)]),
      attendance: ANSWERED,
      expected: start([entry(1, OWED)]),
    },
  ])('updates only that entry when $label', ({ data, attendance, expected }) => {
    expect(withEntryAttendance(data, 2, attendance)).toEqual(expected);
  });
});

describe('latestAnswerErrorOf', () => {
  const since = 1_000;
  const offline = new OfflineAnswerError();
  const broken = new ServerFailureError(500);

  it.each<{ label: string; attempts: StartAnswerAttempt[]; expected: Error | null }>([
    { label: 'she never answered', attempts: [], expected: null },
    {
      label: 'her only answer failed here',
      attempts: [{ submittedAt: 1_200, error: broken }],
      expected: broken,
    },
    {
      label: 'a newer answer is still on its way',
      attempts: [
        { submittedAt: 1_200, error: broken },
        { submittedAt: 1_400, error: null },
      ],
      expected: null,
    },
    {
      label: 'the newest answer failed after an older one was saved',
      attempts: [
        { submittedAt: 1_200, error: null },
        { submittedAt: 1_400, error: offline },
      ],
      expected: offline,
    },
    {
      label: 'the failure came before this surface opened',
      attempts: [{ submittedAt: 900, error: broken }],
      expected: null,
    },
  ])('is $expected when $label', ({ attempts, expected }) => {
    expect(latestAnswerErrorOf(attempts, since)).toBe(expected);
  });
});

describe('toAnswerRollbackOf', () => {
  it.each<{
    label: string;
    pendingAnswers: number;
    confirmed: StartAttendance | null | undefined;
    expected: StartAttendance | null | undefined;
  }>([
    { label: 'her last answer failed', pendingAnswers: 1, confirmed: OWED, expected: OWED },
    {
      label: 'her last answer failed after an earlier one was saved',
      pendingAnswers: 1,
      confirmed: ANSWERED,
      expected: ANSWERED,
    },
    {
      label: 'a later answer is still pending',
      pendingAnswers: 2,
      confirmed: OWED,
      expected: undefined,
    },
    {
      label: 'nothing was confirmed before the answer',
      pendingAnswers: 1,
      confirmed: undefined,
      expected: undefined,
    },
    { label: 'the entry asked nothing before', pendingAnswers: 1, confirmed: null, expected: null },
  ])('restores $expected when $label', ({ pendingAnswers, confirmed, expected }) => {
    expect(toAnswerRollbackOf(pendingAnswers, confirmed)).toEqual(expected);
  });
});
