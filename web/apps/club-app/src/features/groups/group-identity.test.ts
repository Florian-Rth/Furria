import { describe, expect, it } from 'vitest';
import type { GroupTone } from './group-identity';
import { toAnniversary, toClockSpan, toGroupTone } from './group-identity';

describe('toAnniversary', () => {
  it.each([
    { foundedYear: null, sessionYear: 2026, expected: null },
    { foundedYear: 2026, sessionYear: 2026, expected: null },
    { foundedYear: 2025, sessionYear: 2026, expected: null },
    { foundedYear: 2021, sessionYear: 2026, expected: 5 },
    { foundedYear: 1976, sessionYear: 2026, expected: 50 },
    { foundedYear: 2031, sessionYear: 2026, expected: null },
  ])(
    'turns the founded year $foundedYear into $expected years in $sessionYear',
    ({ foundedYear, sessionYear, expected }) => {
      expect(toAnniversary(foundedYear, sessionYear)?.years ?? null).toBe(expected);
    },
  );
});

describe('toGroupTone', () => {
  it.each([
    { groupId: 1, tone: 'rose' as GroupTone, expected: 'rose' },
    { groupId: 2, tone: null, expected: 'lime' },
    { groupId: 12, tone: null, expected: 'lime' },
  ])('paints group $groupId as $expected', ({ groupId, tone, expected }) => {
    expect(toGroupTone(groupId, tone)).toBe(expected);
  });
});

describe('toClockSpan', () => {
  it.each([
    ['19:30:00', 90, { from: '19:30', to: '21:00' }],
    ['09:05', 55, { from: '09:05', to: '10:00' }],
    ['23:15:00', 90, { from: '23:15', to: '00:45' }],
  ])('spans %s for %i minutes', (startsAt, durationMinutes, expected) => {
    expect(toClockSpan(startsAt, durationMinutes)).toEqual(expected);
  });
});
