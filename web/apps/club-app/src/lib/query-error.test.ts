import { describe, expect, it } from 'vitest';
import {
  RequestBlockedError,
  RequestFailedError,
  ServerFailureError,
  UnauthorizedError,
} from '@/lib/api/api-error';
import { type QueryErrorKind, toQueryErrorKind, toQueryErrorMessage } from './query-error';

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
  it('renders the refusal the server wrote, verbatim', () => {
    const error = new RequestFailedError(422, [
      { field: 'endedOn', message: 'Die Ruhezeit liegt außerhalb der Mitgliedschaft.' },
      { field: 'endedOn', message: 'Ignoriert.' },
    ]);

    expect(toQueryErrorMessage(error, MESSAGES)).toBe(
      'Die Ruhezeit liegt außerhalb der Mitgliedschaft.',
    );
  });

  it('falls back to the refusal own neutral message when the server named none', () => {
    const error = new RequestFailedError(409, []);

    expect(toQueryErrorMessage(error, MESSAGES)).toBe(error.firstMessage);
  });

  it.each<[string, Error | null, string | null]>([
    ['nothing to say', null, null],
    ['a 403', new ServerFailureError(403), null],
    ['an unreachable server', new RequestBlockedError(), 'unreachable'],
    ['an unexpected failure', new ServerFailureError(500), 'unexpected'],
  ])('answers %s with %o', (_case, error, expected) => {
    expect(toQueryErrorMessage(error, MESSAGES)).toBe(expected);
  });
});
