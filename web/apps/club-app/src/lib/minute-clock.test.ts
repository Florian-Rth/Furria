import { describe, expect, it } from 'vitest';
import { msUntilNextMinute } from './minute-clock';

describe('msUntilNextMinute', () => {
  it.each([
    {
      label: 'exactly on the minute',
      now: new Date(2026, 10, 11, 11, 10, 0, 0),
      expected: 60_000,
    },
    { label: 'the last instant', now: new Date(2026, 10, 11, 11, 10, 59, 999), expected: 1 },
  ])('waits $expected ms when $label', ({ now, expected }) => {
    expect(msUntilNextMinute(now)).toBe(expected);
  });
});
