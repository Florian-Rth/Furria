import { describe, expect, it } from 'vitest';
import type { ChangeFeedLine } from './change-feed-lines';
import { retryDelayOf, toFeedRefresh } from './change-feed-lines';

describe('toFeedRefresh', () => {
  it.each<[string, ChangeFeedLine, boolean, ReturnType<typeof toFeedRefresh>]>([
    ['the first ready', { kind: 'ready' }, false, { kind: 'none' }],
    ['a ready after a gap', { kind: 'ready' }, true, { kind: 'everything' }],
    ['a heartbeat', { kind: 'ping' }, true, { kind: 'none' }],
    ['missed changes', { kind: 'changes', changes: 'all' }, false, { kind: 'everything' }],
    [
      'known changes',
      { kind: 'changes', changes: ['group', 'groupMembership'] },
      false,
      { kind: 'reads', changes: ['group', 'groupMembership'] },
    ],
    [
      'changes this app does not know yet',
      { kind: 'changes', changes: ['group', 'somethingNew'] },
      false,
      { kind: 'reads', changes: ['group'] },
    ],
    [
      'only unknown changes',
      { kind: 'changes', changes: ['somethingNew'] },
      false,
      { kind: 'none' },
    ],
  ])('refreshes after %s', (_case, line, isReconnect, expected) => {
    expect(toFeedRefresh(line, isReconnect)).toEqual(expected);
  });
});

describe('retryDelayOf', () => {
  it.each([
    [0, 1_000],
    [1, 2_000],
    [4, 16_000],
    [5, 30_000],
    [12, 30_000],
  ])('waits after %i failed attempts for %i ms', (failedAttempts, expected) => {
    expect(retryDelayOf(failedAttempts)).toBe(expected);
  });
});
