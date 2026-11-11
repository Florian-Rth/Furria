import { describe, expect, it } from 'vitest';
import { toMomentDayLabel } from './moment-label';

const TODAY = new Date(2026, 10, 10);

describe('toMomentDayLabel', () => {
  it.each([
    { isoDay: '2026-11-14', expected: 'Sa., 14. Nov.' },
    { isoDay: '2027-02-11', expected: 'Do., 11. Feb. 2027' },
    { isoDay: '', expected: null },
    { isoDay: 'morgen', expected: null },
  ])('writes $isoDay as $expected', ({ isoDay, expected }) => {
    expect(toMomentDayLabel(isoDay, TODAY)).toBe(expected);
  });
});
