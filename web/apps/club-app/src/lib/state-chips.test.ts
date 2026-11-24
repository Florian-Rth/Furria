import { describe, expect, it } from 'vitest';
import { toSessionPeriodState } from './state-chips';

describe('toSessionPeriodState', () => {
  it.each([
    {
      label: 'an open-ended span that has not begun',
      first: 2026,
      last: null,
      expected: 'planned',
    },
    { label: 'a span ending this Session', first: 2020, last: 2025, expected: 'running' },
    { label: 'a span that ended last Session', first: 2020, last: 2024, expected: null },
  ])('is $expected for $label', ({ first, last, expected }) => {
    expect(toSessionPeriodState(first, last, 2025)).toBe(expected);
  });
});
