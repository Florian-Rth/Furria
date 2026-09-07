import { describe, expect, it } from 'vitest';
import { RequestBlockedError, ServerFailureError, UnauthorizedError } from './api-error';
import { shouldRetryRequest } from './retry-policy';

describe('shouldRetryRequest', () => {
  it.each([
    [0, new UnauthorizedError(), false],
    [0, new RequestBlockedError(), true],
    [1, new RequestBlockedError(), false],
    [0, new ServerFailureError(503), true],
    [0, new ServerFailureError(500), true],
    [1, new ServerFailureError(503), false],
    [0, new ServerFailureError(404), false],
    [0, new ServerFailureError(400), false],
    [0, new Error('parsing failed'), false],
  ])('decides after %d failures of %o as %s', (failureCount, error, expected) => {
    expect(shouldRetryRequest(failureCount, error)).toBe(expected);
  });
});
