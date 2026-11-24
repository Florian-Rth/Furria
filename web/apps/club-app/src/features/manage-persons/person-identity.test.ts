import { describe, expect, it } from 'vitest';
import { ageOn, runningFeeReductionOf } from './person-identity';

describe('ageOn', () => {
  it.each([
    ['2007-05-14', '2026-05-13', 18],
    ['2007-05-14', '2026-05-14', 19],
  ])('counts %s on %s as %i', (birthDate, today, age) => {
    expect(ageOn(birthDate, new Date(`${today}T12:00:00`))).toBe(age);
  });
});

describe('runningFeeReductionOf', () => {
  it.each([
    [2027, 7],
    [2028, null],
  ])('finds the reduction running in %i', (year, id) => {
    const reduction = runningFeeReductionOf(
      [{ feeReductionId: 7, basis: 'school', firstSessionYear: 2025, lastSessionYear: 2027 }],
      year,
    );

    expect(reduction?.feeReductionId ?? null).toBe(id);
  });
});
