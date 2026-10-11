import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/errors';
import { resolvePublicSource, shouldRetryPublicRead } from './public-source';

const retry = (): void => {};

describe('resolvePublicSource', () => {
  it.each<[string, string[] | undefined, boolean, string]>([
    ['nothing arrived or failed yet', undefined, false, 'loading'],
    ['the request gave up', undefined, true, 'error'],
    ['a later refetch fails', ['cached'], true, 'ready'],
    ['nothing is published yet', [], false, 'ready'],
  ])('when %s the source is %s', (_, data, hasFailed, status) => {
    expect(resolvePublicSource(data, hasFailed, retry).status).toBe(status);
  });
});

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
