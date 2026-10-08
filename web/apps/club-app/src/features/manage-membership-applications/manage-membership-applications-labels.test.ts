import { describe, expect, it } from 'vitest';
import { waitingDaysOf } from './manage-membership-applications-labels';

describe('waitingDaysOf', () => {
  const now = new Date(2026, 9, 2, 9, 30);

  it.each([
    { scenario: 'earlier today', confirmedAt: new Date(2026, 9, 2, 0, 15), expected: 0 },
    { scenario: 'late yesterday', confirmedAt: new Date(2026, 9, 1, 23, 50), expected: 1 },
    { scenario: 'across a month end', confirmedAt: new Date(2026, 8, 29, 18, 0), expected: 3 },
    { scenario: 'later today', confirmedAt: new Date(2026, 9, 2, 9, 45), expected: 0 },
    { scenario: 'tomorrow', confirmedAt: new Date(2026, 9, 3, 8, 0), expected: 0 },
  ])('counts $expected days for a confirmation $scenario', ({ confirmedAt, expected }) => {
    expect(waitingDaysOf(confirmedAt.toISOString(), now)).toBe(expected);
  });
});
