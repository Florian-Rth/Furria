import { describe, expect, it } from 'vitest';
import { RequestBlockedError, ServerFailureError, UnauthorizedError } from '@/lib/api/api-error';
import { type QueryErrorKind, toQueryErrorKind } from './query-error';

describe('toQueryErrorKind', () => {
  it.each<[string, Error | null, QueryErrorKind | null]>([
    ['no error at all', null, null],
    ['a terminal 401 the session layer already handled', new UnauthorizedError(), null],
    ['a request that never left the device', new RequestBlockedError(), 'unreachable'],
    ['a server failure', new ServerFailureError(500), 'unexpected'],
    ['a rejected request payload', new ServerFailureError(400), 'unexpected'],
    ['an error from outside the API layer', new Error('boom'), 'unexpected'],
  ])('maps %s to %s', (_case, error, expected) => {
    expect(toQueryErrorKind(error)).toBe(expected);
  });
});
