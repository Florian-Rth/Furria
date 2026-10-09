import { describe, expect, it } from 'vitest';
import type { PurgeCountdown } from './bin-countdown';
import { binGroupsOf, purgeCountdownOf } from './bin-countdown';

describe('purgeCountdownOf', () => {
  const now = new Date('2026-10-09T12:00:00Z');

  it.each<[string, string, PurgeCountdown]>([
    ['a month ahead', '2026-11-08T12:00:00Z', { daysLeft: 30, urgency: 'calm' }],
    ['part of a day counts as one', '2026-10-12T13:00:00Z', { daysLeft: 4, urgency: 'calm' }],
    ['three days left', '2026-10-12T12:00:00Z', { daysLeft: 3, urgency: 'urgent' }],
    ['already due', '2026-10-08T12:00:00Z', { daysLeft: 0, urgency: 'urgent' }],
  ])('%s', (_case, purgesAt, expected) => {
    expect(purgeCountdownOf(purgesAt, now)).toEqual(expected);
  });
});

describe('binGroupsOf', () => {
  it('groups by album, the album purged soonest first', () => {
    const groups = binGroupsOf([
      { albumId: 1, albumTitle: 'A', purgesAt: '2026-11-01T00:00:00Z' },
      { albumId: 2, albumTitle: 'B', purgesAt: '2026-10-20T00:00:00Z' },
      { albumId: 1, albumTitle: 'A', purgesAt: '2026-10-15T00:00:00Z' },
    ]);

    expect(
      groups.map((group) => [group.albumId, group.entries.length, group.firstPurgesAt]),
    ).toEqual([
      [1, 2, '2026-10-15T00:00:00Z'],
      [2, 1, '2026-10-20T00:00:00Z'],
    ]);
  });
});
