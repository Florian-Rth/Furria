import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import type { ResetFailureKind } from './reset-failure';
import { toResetFailureKind } from './reset-failure';

describe('toResetFailureKind', () => {
  it.each<[string, Error | null, ResetFailureKind | null]>([
    ['no error', null, null],
    ['a blocked request', new ApiError({ kind: 'unreachable' }), 'unreachable'],
    [
      'a refused reset link',
      new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'reset', message: 'gilt nicht mehr' }],
      }),
      'dead',
    ],
    [
      'a refused password',
      new ApiError({
        kind: 'refused',
        status: 400,
        fields: [{ field: 'password', message: 'zu kurz' }],
      }),
      'password',
    ],
    ['a throttled reset link', new ApiError({ kind: 'throttled' }), 'throttled'],
    ['a server failure', new ApiError({ kind: 'status', status: 500 }), 'unexpected'],
  ])('classifies %s', (_case, error, expected) => {
    expect(toResetFailureKind(error)).toBe(expected);
  });
});
