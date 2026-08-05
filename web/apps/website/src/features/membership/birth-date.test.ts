import { describe, expect, it } from 'vitest';
import { buildBirthDateBounds, formatBirthDateValue, parseBirthDateValue } from './birth-date';

describe('formatBirthDateValue', () => {
  it('writes the date the payload expects', () => {
    expect(formatBirthDateValue(new Date(1994, 2, 14))).toBe('1994-03-14');
  });

  it('pads month and day', () => {
    expect(formatBirthDateValue(new Date(2009, 0, 5))).toBe('2009-01-05');
  });

  it('empties the field when the picker holds nothing', () => {
    expect(formatBirthDateValue(null)).toBe('');
  });

  it('empties the field instead of writing an unparsable date', () => {
    expect(formatBirthDateValue(new Date('kein Datum'))).toBe('');
  });
});

describe('parseBirthDateValue', () => {
  it('reads back what it wrote', () => {
    expect(formatBirthDateValue(parseBirthDateValue('1994-03-14'))).toBe('1994-03-14');
  });

  it('refuses a half-typed date', () => {
    expect(parseBirthDateValue('1994-03')).toBeNull();
  });
});

describe('buildBirthDateBounds', () => {
  it('never lets a birthday fall after today', () => {
    const today = new Date(2026, 7, 5);

    expect(buildBirthDateBounds(today).maxDate).toEqual(today);
  });

  it('stops at the age the derivation still calls plausible', () => {
    expect(formatBirthDateValue(buildBirthDateBounds(new Date(2026, 7, 5)).minDate)).toBe(
      '1906-08-05',
    );
  });
});
