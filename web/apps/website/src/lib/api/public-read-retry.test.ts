import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/errors';
import { shouldRetryPublicRead } from './public-read-retry';

describe('shouldRetryPublicRead', () => {
  it.each([
    [0, new ApiError(404), false],
    [0, new ApiError(503), true],
    [0, new Error('offline'), true],
    [1, new ApiError(503), false],
  ])('after %i failures on %s retries: %s', (failureCount, error, retries) => {
    expect(shouldRetryPublicRead(failureCount, error)).toBe(retries);
  });
});
