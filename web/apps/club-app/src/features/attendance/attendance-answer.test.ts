import { describe, expect, it } from 'vitest';
import { RequestBlockedError, RequestFailedError, ServerFailureError } from '@/lib/api/api-error';
import type { AttendanceAttempt, AttendanceFailure } from './attendance-answer';
import {
  latestAnswerErrorOf,
  OfflineAnswerError,
  toAttendanceFailureOf,
} from './attendance-answer';

describe('toAttendanceFailureOf', () => {
  it.each<{ label: string; error: Error | null; expected: AttendanceFailure | null }>([
    { label: 'nothing failed', error: null, expected: null },
    { label: 'the device was offline', error: new OfflineAnswerError(), expected: 'offline' },
    { label: 'the request never arrived', error: new RequestBlockedError(), expected: 'unsaved' },
    { label: 'the server broke', error: new ServerFailureError(500), expected: 'unsaved' },
    { label: 'the entry was deleted', error: new ServerFailureError(404), expected: 'gone' },
    { label: 'she may no longer see it', error: new ServerFailureError(403), expected: 'gone' },
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
    expect(toAttendanceFailureOf(error)).toBe(expected);
  });
});

describe('latestAnswerErrorOf', () => {
  const since = 1_000;
  const broken = new ServerFailureError(500);

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
