import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import { OfflineWriteError } from '@/lib/api/offline-write-error';
import type { Start, StartAttendance, StartEntry } from './schemas';
import type { StartAnswerAttempt, StartAnswerFailure } from './start-answer';
import { latestAnswerErrorOf, toAnswerFailureOf, withEntryAttendance } from './start-answer';

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
    { label: 'the device was offline', error: new OfflineWriteError(), expected: 'offline' },
    {
      label: 'the request never arrived',
      error: new ApiError({ kind: 'unreachable' }),
      expected: 'unsaved',
    },
    {
      label: 'the server broke',
      error: new ApiError({ kind: 'status', status: 500 }),
      expected: 'unsaved',
    },
    {
      label: 'the entry was deleted',
      error: new ApiError({ kind: 'status', status: 404 }),
      expected: 'gone',
    },
    {
      label: 'the entry stopped asking',
      error: new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'answer', message: 'Keine Antwort erbeten.' }],
      }),
      expected: 'notAsked',
    },
    {
      label: 'the entry stopped asking without details',
      error: new ApiError({ kind: 'status', status: 400 }),
      expected: 'notAsked',
    },
    {
      label: 'the answer collided',
      error: new ApiError({ kind: 'refused', status: 409, fields: [] }),
      expected: 'conflict',
    },
  ])('is $expected when $label', ({ error, expected }) => {
    expect(toAnswerFailureOf(error)).toBe(expected);
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
  const broken = new ApiError({ kind: 'status', status: 500 });

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
      label: 'the failure came before this surface opened',
      attempts: [{ submittedAt: 900, error: broken }],
      expected: null,
    },
  ])('is $expected when $label', ({ attempts, expected }) => {
    expect(latestAnswerErrorOf(attempts, since)).toBe(expected);
  });
});
