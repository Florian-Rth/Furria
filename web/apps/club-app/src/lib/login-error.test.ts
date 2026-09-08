import { describe, expect, it } from 'vitest';
import { RequestBlockedError, ServerFailureError, UnauthorizedError } from '@/lib/api/api-error';
import { type LoginErrorKind, toLoginErrorKind } from './login-error';

describe('toLoginErrorKind', () => {
  it.each<[string, Error | null, LoginErrorKind | null]>([
    ['no error at all', null, null],
    ['a rejected credential pair', new UnauthorizedError(), 'invalid-credentials'],
    ['a request that never left the device', new RequestBlockedError(), 'unreachable'],
    ['a server failure', new ServerFailureError(500), 'unexpected'],
    ['a rejected request payload', new ServerFailureError(400), 'unexpected'],
    ['an error from outside the API layer', new Error('boom'), 'unexpected'],
  ])('maps %s to %s', (_case, error, expected) => {
    expect(toLoginErrorKind(error)).toBe(expected);
  });
});
