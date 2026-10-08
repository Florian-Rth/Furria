import { describe, expect, it } from 'vitest';
import { toSessionPeriodState, toStateFilterOptions, toStateStats } from './state-chips';

describe('toStateFilterOptions', () => {
  it.each([
    {
      label: 'every state occurs',
      counts: { active: 134, paused: 12, ended: 4, none: 6 },
      expected: [
        { id: 'all', count: 156 },
        { id: 'active', count: 134 },
        { id: 'paused', count: 12 },
        { id: 'ended', count: 4 },
        { id: 'none', count: 6 },
      ],
    },
    {
      label: 'some states are empty',
      counts: { active: 0, paused: 0, ended: 0, none: 1 },
      expected: [
        { id: 'all', count: 1 },
        { id: 'none', count: 1 },
      ],
    },
    {
      label: 'nobody is counted',
      counts: { active: 0, paused: 0, ended: 0, none: 0 },
      expected: [{ id: 'all', count: 0 }],
    },
  ])(
    'offers the total first and the occurring states in club order when $label',
    ({ counts, expected }) => {
      expect(toStateFilterOptions(counts).map(({ id, count }) => ({ id, count }))).toEqual(
        expected,
      );
    },
  );
});

describe('toStateStats', () => {
  it('keeps the occurring states in club order, letting only aktiv lead', () => {
    expect(
      toStateStats({ active: 113, paused: 0, ended: 14, none: 18 }).map(
        ({ state, count, tone }) => ({ state, count, tone }),
      ),
    ).toEqual([
      { state: 'active', count: 113, tone: 'default' },
      { state: 'ended', count: 14, tone: 'muted' },
      { state: 'none', count: 18, tone: 'muted' },
    ]);
  });
});

describe('toSessionPeriodState', () => {
  it.each([
    { label: 'an open-ended span that has begun', first: 2020, last: null, expected: 'running' },
    {
      label: 'an open-ended span that has not begun',
      first: 2026,
      last: null,
      expected: 'planned',
    },
    { label: 'a span ending this Session', first: 2020, last: 2025, expected: 'running' },
    { label: 'a span starting this Session', first: 2025, last: 2027, expected: 'running' },
    { label: 'a span that ended last Session', first: 2020, last: 2024, expected: null },
    { label: 'a span wholly in the future', first: 2026, last: 2029, expected: 'planned' },
  ])('is $expected for $label', ({ first, last, expected }) => {
    expect(toSessionPeriodState(first, last, 2025)).toBe(expected);
  });
});
