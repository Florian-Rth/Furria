import { describe, expect, it } from 'vitest';
import { toStartDayQuickChoices } from './calendar-labels';

describe('toStartDayQuickChoices', () => {
  it.each([
    { today: new Date(2026, 9, 13), expected: ['2026-10-13', '2026-10-14'] },
    { today: new Date(2026, 9, 31), expected: ['2026-10-31', '2026-11-01'] },
    { today: new Date(2026, 11, 31), expected: ['2026-12-31', '2027-01-01'] },
  ])('offers today and the following day for $today', ({ today, expected }) => {
    expect(toStartDayQuickChoices(today).map((choice) => choice.value)).toEqual(expected);
  });
});
