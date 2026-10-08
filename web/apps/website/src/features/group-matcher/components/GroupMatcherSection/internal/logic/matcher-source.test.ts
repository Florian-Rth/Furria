import { describe, expect, it } from 'vitest';
import type { GroupMatcher } from '@/lib/seed/group-matcher';
import { resolveMatcherSource } from './matcher-source';

const retry = (): void => {};
const matcher: GroupMatcher = { groups: [], questions: [] };

describe('resolveMatcherSource', () => {
  it.each([
    ['waits while the questions are on their way', undefined, false, 'loading'],
    ['offers a retry once the questions failed', undefined, true, 'error'],
    ['hands over the questions once they arrived', matcher, false, 'ready'],
    ['keeps the questions when a later refetch fails', matcher, true, 'ready'],
  ])('%s', (_, source, hasFailed, status) => {
    expect(resolveMatcherSource(source, hasFailed, retry).status).toBe(status);
  });
});
