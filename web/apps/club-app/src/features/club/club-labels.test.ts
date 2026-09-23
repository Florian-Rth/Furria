import { describe, expect, it } from 'vitest';
import { toClubStatEntries, toCountdownLabel, toNumberLabel } from './club-labels';

describe('toCountdownLabel', () => {
  it.each([
    { days: -3, expected: 'heute um 11:11 Uhr' },
    { days: 0, expected: 'heute um 11:11 Uhr' },
    { days: 1, expected: 'noch 1 Tag' },
    { days: 2, expected: 'noch 2 Tage' },
    { days: 53, expected: 'noch 53 Tage' },
    { days: 264, expected: 'noch 264 Tage' },
  ])('reads "$expected" at $days days', ({ days, expected }) => {
    expect(toCountdownLabel(days)).toBe(expected);
  });
});

describe('toNumberLabel', () => {
  it.each([
    { sessionNumber: null, expected: null },
    { sessionNumber: 56, expected: '56. Session' },
    { sessionNumber: 1, expected: '1. Session' },
  ])('turns $sessionNumber into $expected', ({ sessionNumber, expected }) => {
    expect(toNumberLabel(sessionNumber)).toBe(expected);
  });
});

describe('toClubStatEntries', () => {
  it.each([
    {
      label: 'all three stats have something to say',
      stats: { memberCount: 128, groupCount: 9, joinedThisSessionCount: 4 },
      expected: [
        { id: 'members', count: 128 },
        { id: 'groups', count: 9 },
        { id: 'joined', count: 4 },
      ],
    },
    {
      label: 'nobody joined this Session',
      stats: { memberCount: 128, groupCount: 9, joinedThisSessionCount: 0 },
      expected: [
        { id: 'members', count: 128 },
        { id: 'groups', count: 9 },
      ],
    },
    {
      label: 'the club has no Gruppen yet',
      stats: { memberCount: 3, groupCount: 0, joinedThisSessionCount: 3 },
      expected: [
        { id: 'members', count: 3 },
        { id: 'joined', count: 3 },
      ],
    },
    {
      label: 'the database is fresh',
      stats: { memberCount: 0, groupCount: 0, joinedThisSessionCount: 0 },
      expected: [],
    },
  ])('keeps $expected.length stats when $label', ({ stats, expected }) => {
    const entries = toClubStatEntries(stats).map((entry) => ({
      id: entry.id,
      count: entry.count,
    }));

    expect(entries).toEqual(expected);
  });
});
