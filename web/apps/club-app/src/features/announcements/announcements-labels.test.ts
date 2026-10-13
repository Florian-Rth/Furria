import { describe, expect, it } from 'vitest';
import { toValidUntilQuickChoices } from './announcements-labels';

describe('toValidUntilQuickChoices', () => {
  it.each([
    { today: new Date(2026, 9, 13), expected: ['2026-10-20', '2026-11-10'] },
    { today: new Date(2026, 11, 28), expected: ['2027-01-04', '2027-01-25'] },
  ])('offers one and four weeks ahead of $today', ({ today, expected }) => {
    expect(toValidUntilQuickChoices(today).map((choice) => choice.value)).toEqual(expected);
  });
});
