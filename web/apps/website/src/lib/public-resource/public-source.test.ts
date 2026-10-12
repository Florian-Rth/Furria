import { describe, expect, it } from 'vitest';
import { resolvePublicSource } from './public-source';

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
