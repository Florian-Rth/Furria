import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/errors';
import { shouldRetryEventRead } from './api';

describe('shouldRetryEventRead', () => {
  it.each([
    [0, new ApiError(404), false],
    [0, new ApiError(503), true],
    [0, new Error('offline'), true],
    [1, new ApiError(503), false],
  ])('after %i failures on %s retries: %s', (failureCount, error, retries) => {
    expect(shouldRetryEventRead(failureCount, error)).toBe(retries);
  });
});
