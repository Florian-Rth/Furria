import { describe, expect, it } from 'vitest';
import type { CountdownKind } from './club-labels';
import { countdownKindOf, toClubStatEntries } from './club-labels';

describe('countdownKindOf', () => {
  it.each<[number, CountdownKind]>([
    [-3, 'today'],
    [0, 'today'],
    [1, 'oneDay'],
    [2, 'days'],
  ])('reads %i days as %s', (days, expected) => {
    expect(countdownKindOf(days)).toBe(expected);
  });
});

describe('toClubStatEntries', () => {
  it.each([
    {
      label: 'all three stats have something to say',
      stats: { memberCount: 128, groupCount: 9, joinedThisSessionCount: 4 },
      expected: ['members', 'groups', 'joined'],
    },
    {
      label: 'the club has no Gruppen yet',
      stats: { memberCount: 3, groupCount: 0, joinedThisSessionCount: 3 },
      expected: ['members', 'joined'],
    },
  ])('keeps $expected when $label', ({ stats, expected }) => {
    expect(toClubStatEntries(stats).map((entry) => entry.id)).toEqual(expected);
  });
});
