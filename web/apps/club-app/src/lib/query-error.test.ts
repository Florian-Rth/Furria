import { ApiError } from '@furria/api-client';
import { describe, expect, it } from 'vitest';
import { OfflineWriteError } from '@/lib/api/offline-write-error';
import {
  isForbiddenError,
  isNotFoundError,
  type QueryErrorKind,
  type QueryFailureKind,
  toQueryErrorKind,
  toQueryErrorMessage,
} from './query-error';

const MESSAGES: Record<QueryErrorKind, string> = {
  unreachable: 'unreachable',
  unexpected: 'unexpected',
  rejected: 'rejected',
};

describe('toQueryErrorKind', () => {
  it.each<[string, Error | null, QueryFailureKind | null]>([
    ['no error at all', null, null],
    [
      'a terminal 401 the session layer already handled',
      new ApiError({ kind: 'unauthorized' }),
      null,
    ],
    [
      'a 403 the cached permissions did not foresee',
      new ApiError({ kind: 'status', status: 403 }),
      'forbidden',
    ],
    ['a rate limit', new ApiError({ kind: 'throttled' }), 'throttled'],
    ['a server that answered too slowly', new ApiError({ kind: 'timedOut' }), 'timedOut'],
    ['a write held back while offline', new OfflineWriteError(), 'unreachable'],
    ['a request that never left the device', new ApiError({ kind: 'unreachable' }), 'unreachable'],
    ['a server failure', new ApiError({ kind: 'status', status: 500 }), 'unexpected'],
    ['a refused write', new ApiError({ kind: 'refused', status: 409, fields: [] }), 'rejected'],
    ['a body that drifted from the schema', new ApiError({ kind: 'mismatch' }), 'unexpected'],
    ['an error from outside the API layer', new Error('boom'), 'unexpected'],
  ])('maps %s to %s', (_case, error, expected) => {
    expect(toQueryErrorKind(error)).toBe(expected);
  });
});

describe('toQueryErrorMessage', () => {
  it('passes on the refusal the server wrote', () => {
    const error = new ApiError({
      kind: 'refused',
      status: 422,
      fields: [{ field: 'endedOn', message: 'refusal' }],
    });

    expect(toQueryErrorMessage(error, MESSAGES)).toBe('refusal');
  });

  it.each<[string, Error | null, string | null]>([
    ['nothing to say', null, null],
    ['an unreachable server', new ApiError({ kind: 'unreachable' }), 'unreachable'],
  ])('answers %s with %o', (_case, error, expected) => {
    expect(toQueryErrorMessage(error, MESSAGES)).toBe(expected);
  });
});

describe('isNotFoundError', () => {
  it.each<[string, Error | null, boolean]>([
    ['a detail route whose id is gone', new ApiError({ kind: 'status', status: 404 }), true],
    ['any other server failure', new ApiError({ kind: 'status', status: 500 }), false],
    ['nothing at all', null, false],
  ])('answers %s with %s', (_case, error, expected) => {
    expect(isNotFoundError(error)).toBe(expected);
  });
});

describe('isForbiddenError', () => {
  it.each<[string, Error | null, boolean]>([
    ['a Gruppe that is not the caller own', new ApiError({ kind: 'status', status: 403 }), true],
    ['a detail route whose id is gone', new ApiError({ kind: 'status', status: 404 }), false],
    ['a terminal 401', new ApiError({ kind: 'unauthorized' }), false],
  ])('answers %s with %s', (_case, error, expected) => {
    expect(isForbiddenError(error)).toBe(expected);
  });
});
