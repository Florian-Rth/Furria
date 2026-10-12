import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import { type LoginErrorKind, toLoginErrorKind } from './login-error';

describe('toLoginErrorKind', () => {
  it.each<[string, Error | null, LoginErrorKind | null]>([
    ['no error at all', null, null],
    ['a rejected credential pair', new ApiError({ kind: 'unauthorized' }), 'invalid-credentials'],
    ['a request that never left the device', new ApiError({ kind: 'unreachable' }), 'unreachable'],
    [
      'too many failed sign-ins from this address',
      new ApiError({ kind: 'throttled' }),
      'throttled',
    ],
    ['a server failure', new ApiError({ kind: 'status', status: 500 }), 'unexpected'],
  ])('maps %s to %s', (_case, error, expected) => {
    expect(toLoginErrorKind(error)).toBe(expected);
  });
});
