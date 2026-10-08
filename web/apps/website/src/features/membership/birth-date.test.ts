import { describe, expect, it } from 'vitest';
import { buildBirthDateBounds, formatBirthDateValue } from './birth-date';

describe('formatBirthDateValue', () => {
  it.each<[Date | null, string]>([
    [new Date(2009, 0, 5), '2009-01-05'],
    [null, ''],
    [new Date('kein Datum'), ''],
  ])('writes %s as %j', (date, value) => {
    expect(formatBirthDateValue(date)).toBe(value);
  });
});

describe('buildBirthDateBounds', () => {
  it('stops at the age the derivation still calls plausible', () => {
    expect(formatBirthDateValue(buildBirthDateBounds(new Date(2026, 7, 5)).minDate)).toBe(
      '1906-08-05',
    );
  });
});
