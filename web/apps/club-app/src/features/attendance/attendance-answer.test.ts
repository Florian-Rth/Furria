import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import { OfflineWriteError } from '@/lib/api/offline-write-error';
import type { AttendanceAttempt, AttendanceFailure } from './attendance-answer';
import { latestAnswerErrorOf, resubmitsAfter, toAttendanceFailureOf } from './attendance-answer';

describe('toAttendanceFailureOf', () => {
  it.each<{ label: string; error: Error | null; expected: AttendanceFailure | null }>([
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
      label: 'she may no longer see it',
      error: new ApiError({ kind: 'status', status: 403 }),
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
    expect(toAttendanceFailureOf(error)).toBe(expected);
  });
});

describe('resubmitsAfter', () => {
  it.each<{ label: string; error: Error; isResubmission: boolean; expected: boolean }>([
    {
      label: 'her first answer collided with a parallel one',
      error: new ApiError({ kind: 'refused', status: 409, fields: [] }),
      isResubmission: false,
      expected: true,
    },
    {
      label: 'the resubmission collided again',
      error: new ApiError({ kind: 'refused', status: 409, fields: [] }),
      isResubmission: true,
      expected: false,
    },
    {
      label: 'the server broke',
      error: new ApiError({ kind: 'status', status: 500 }),
      isResubmission: false,
      expected: false,
    },
  ])('is $expected when $label', ({ error, isResubmission, expected }) => {
    expect(resubmitsAfter(error, isResubmission)).toBe(expected);
  });
});

describe('latestAnswerErrorOf', () => {
  const since = 1_000;
  const broken = new ApiError({ kind: 'status', status: 500 });

  it.each<{ label: string; attempts: AttendanceAttempt[]; expected: Error | null }>([
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
