import { describe, expect, it } from 'vitest';
import { RequestBlockedError, RequestFailedError, ServerFailureError } from '@/lib/api/api-error';
import type { ResetFailureKind } from './reset-failure';
import { toResetFailureKind } from './reset-failure';

describe('toResetFailureKind', () => {
  it.each<[string, Error | null, ResetFailureKind | null]>([
    ['no error', null, null],
    ['a blocked request', new RequestBlockedError(), 'unreachable'],
    [
      'a refused reset link',
      new RequestFailedError(400, [{ field: 'reset', message: 'gilt nicht mehr' }]),
      'dead',
    ],
    [
      'a refused password',
      new RequestFailedError(400, [{ field: 'password', message: 'zu kurz' }]),
      'password',
    ],
    [
      'a refused password in server casing',
      new RequestFailedError(400, [{ field: 'Password', message: 'zu kurz' }]),
      'password',
    ],
    ['a throttled reset link', new ServerFailureError(429), 'throttled'],
    ['a server failure', new ServerFailureError(500), 'unexpected'],
  ])('classifies %s', (_case, error, expected) => {
    expect(toResetFailureKind(error)).toBe(expected);
  });
});
