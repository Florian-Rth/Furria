import { describe, expect, it } from 'vitest';
import {
  RequestBlockedError,
  RequestFailedError,
  ServerFailureError,
  UnauthorizedError,
} from '@/lib/api/api-error';
import {
  isForbiddenError,
  isNotFoundError,
  type QueryErrorKind,
  toQueryErrorKind,
  toQueryErrorMessage,
} from './query-error';

const MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'unreachable',
  unexpected: 'unexpected',
  rejected: 'rejected',
};

describe('toQueryErrorKind', () => {
  it.each<[string, Error | null, QueryErrorKind | null]>([
    ['no error at all', null, null],
    ['a terminal 401 the session layer already handled', new UnauthorizedError(), null],
    ['a 403 a guard is about to answer', new ServerFailureError(403), null],
    ['a request that never left the device', new RequestBlockedError(), 'unreachable'],
    ['a server failure', new ServerFailureError(500), 'unexpected'],
    ['a refused write', new RequestFailedError(409, []), 'rejected'],
    ['an error from outside the API layer', new Error('boom'), 'unexpected'],
  ])('maps %s to %s', (_case, error, expected) => {
    expect(toQueryErrorKind(error)).toBe(expected);
  });
});

describe('toQueryErrorMessage', () => {
  it('passes on the refusal the server wrote', () => {
    const error = new RequestFailedError(422, [{ field: 'endedOn', message: 'refusal' }]);

    expect(toQueryErrorMessage(error, MESSAGES)).toBe(error.firstMessage);
  });

  it.each<[string, Error | null, string | null]>([
    ['nothing to say', null, null],
    ['an unreachable server', new RequestBlockedError(), 'unreachable'],
  ])('answers %s with %o', (_case, error, expected) => {
    expect(toQueryErrorMessage(error, MESSAGES)).toBe(expected);
  });
});

describe('isNotFoundError', () => {
  it.each<[string, Error | null, boolean]>([
    ['a detail route whose id is gone', new ServerFailureError(404), true],
    ['any other server failure', new ServerFailureError(500), false],
    ['nothing at all', null, false],
  ])('answers %s with %s', (_case, error, expected) => {
    expect(isNotFoundError(error)).toBe(expected);
  });
});

describe('isForbiddenError', () => {
  it.each<[string, Error | null, boolean]>([
    ['a Gruppe that is not the caller own', new ServerFailureError(403), true],
    ['a detail route whose id is gone', new ServerFailureError(404), false],
    ['a terminal 401', new UnauthorizedError(), false],
  ])('answers %s with %s', (_case, error, expected) => {
    expect(isForbiddenError(error)).toBe(expected);
  });
});
