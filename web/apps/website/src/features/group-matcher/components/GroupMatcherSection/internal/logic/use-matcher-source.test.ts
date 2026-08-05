import { describe, expect, it } from 'vitest';
import { SEEDED_GROUP_MATCHER } from '@/lib/seed/group-matcher';
import { resolveMatcherSource } from './use-matcher-source';

const retry = (): void => {};

describe('resolveMatcherSource', () => {
  it('waits while the questions are still on their way', () => {
    expect(resolveMatcherSource(undefined, false, retry)).toEqual({ status: 'loading' });
  });

  it('offers a retry once the questions failed to arrive', () => {
    expect(resolveMatcherSource(undefined, true, retry)).toEqual({ status: 'error', retry });
  });

  it('hands over the questions as soon as they are there', () => {
    expect(resolveMatcherSource(SEEDED_GROUP_MATCHER, false, retry)).toEqual({
      status: 'ready',
      matcher: SEEDED_GROUP_MATCHER,
    });
  });

  it('keeps the questions on screen when a later refetch fails', () => {
    expect(resolveMatcherSource(SEEDED_GROUP_MATCHER, true, retry).status).toBe('ready');
  });
});
