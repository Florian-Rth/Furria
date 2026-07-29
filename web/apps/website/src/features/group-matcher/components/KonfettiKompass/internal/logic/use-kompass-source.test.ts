import { describe, expect, it } from 'vitest';
import { SEEDED_GROUP_MATCHER } from '@/lib/seed/group-matcher';
import { resolveKompassSource } from './use-kompass-source';

const retry = (): void => {};

describe('resolveKompassSource', () => {
  it('waits while the questions are still on their way', () => {
    expect(resolveKompassSource(undefined, false, retry)).toEqual({ status: 'loading' });
  });

  it('offers a retry once the questions failed to arrive', () => {
    expect(resolveKompassSource(undefined, true, retry)).toEqual({ status: 'error', retry });
  });

  it('hands over the questions as soon as they are there', () => {
    expect(resolveKompassSource(SEEDED_GROUP_MATCHER, false, retry)).toEqual({
      status: 'ready',
      matcher: SEEDED_GROUP_MATCHER,
    });
  });

  it('keeps the questions on screen when a later refetch fails', () => {
    expect(resolveKompassSource(SEEDED_GROUP_MATCHER, true, retry).status).toBe('ready');
  });
});
