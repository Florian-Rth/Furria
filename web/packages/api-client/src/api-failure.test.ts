import { describe, expect, it } from 'vitest';
import type { ApiFailure } from './api-failure';
import { ApiError, apiStatusOf, refusalMessageOf, shouldRetryRequest } from './api-failure';

const refused = (status: 400 | 409 | 422, messages: readonly string[]): ApiError =>
  new ApiError({
    kind: 'refused',
    status,
    fields: messages.map((message) => ({ field: 'name', message })),
  });

describe('apiStatusOf', () => {
  it.each<[string, Error | null, number | null]>([
    ['nothing at all', null, null],
    ['an error from outside the API', new Error('boom'), null],
    ['a request that never left the device', new ApiError({ kind: 'unreachable' }), null],
    ['a body that drifted', new ApiError({ kind: 'mismatch' }), null],
    ['a terminal 401', new ApiError({ kind: 'unauthorized' }), 401],
    ['a rate limit', new ApiError({ kind: 'throttled' }), 429],
    ['a refusal', refused(409, []), 409],
    ['a bare status', new ApiError({ kind: 'status', status: 404 }), 404],
  ])('reads %s as %s', (_case, error, expected) => {
    expect(apiStatusOf(error)).toBe(expected);
  });
});

describe('refusalMessageOf', () => {
  it.each<[string, Error | null, string | null]>([
    ['a refusal with reasons', refused(400, ['erste', 'zweite']), 'erste'],
    ['a refusal without reasons', refused(422, []), null],
    ['a server failure', new ApiError({ kind: 'status', status: 500 }), null],
    ['nothing at all', null, null],
  ])('reads %s as %s', (_case, error, expected) => {
    expect(refusalMessageOf(error)).toBe(expected);
  });
});

describe('shouldRetryRequest', () => {
  it.each<[number, ApiFailure | null, boolean]>([
    [0, { kind: 'unreachable' }, true],
    [1, { kind: 'unreachable' }, false],
    [0, { kind: 'status', status: 503 }, true],
    [0, { kind: 'status', status: 404 }, false],
    [0, { kind: 'unauthorized' }, false],
    [0, { kind: 'throttled' }, false],
    [0, { kind: 'refused', status: 409, fields: [] }, false],
    [0, { kind: 'mismatch' }, false],
    [0, null, false],
  ])('after %i failures of %o retries: %s', (failureCount, failure, expected) => {
    const error = failure === null ? new Error('boom') : new ApiError(failure);

    expect(shouldRetryRequest(failureCount, error)).toBe(expected);
  });
});
