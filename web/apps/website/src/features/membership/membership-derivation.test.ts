import { describe, expect, it } from 'vitest';
import {
  ACTIVE_FEE_EUROS,
  calculateAge,
  deriveMembership,
  MAJORITY_AGE,
  parseBirthDate,
  YOUTH_FEE_EUROS,
} from './membership-derivation';

const localDate = (value: string): Date => new Date(`${value}T12:00`);

describe('parseBirthDate', () => {
  it('parses a date-only string on the local calendar', () => {
    const parsed = parseBirthDate('1994-03-14');

    expect(parsed?.getFullYear()).toBe(1994);
    expect(parsed?.getMonth()).toBe(2);
    expect(parsed?.getDate()).toBe(14);
  });

  it('keeps the first of January on the first of January', () => {
    const parsed = parseBirthDate('2010-01-01');

    expect(parsed?.getFullYear()).toBe(2010);
    expect(parsed?.getMonth()).toBe(0);
    expect(parsed?.getDate()).toBe(1);
  });

  it('rejects an empty value', () => {
    expect(parseBirthDate('')).toBeNull();
  });

  it('rejects anything that is not a date-only string', () => {
    expect(parseBirthDate('14.03.1994')).toBeNull();
    expect(parseBirthDate('1994-3-14')).toBeNull();
    expect(parseBirthDate('irgendwas')).toBeNull();
  });

  it('rejects a day the month does not have', () => {
    expect(parseBirthDate('2026-02-30')).toBeNull();
    expect(parseBirthDate('2026-13-01')).toBeNull();
  });
});

describe('calculateAge', () => {
  it('counts a full year on the birthday itself', () => {
    expect(calculateAge(localDate('2008-07-30'), localDate('2026-07-30'))).toBe(18);
  });

  it('is still one year younger the day before the birthday', () => {
    expect(calculateAge(localDate('2008-07-30'), localDate('2026-07-29'))).toBe(17);
  });

  it('counts the year after the birthday has passed', () => {
    expect(calculateAge(localDate('2008-07-30'), localDate('2026-07-31'))).toBe(18);
  });

  it('handles a birthday later in the year', () => {
    expect(calculateAge(localDate('2008-12-31'), localDate('2026-01-01'))).toBe(17);
  });

  it('counts a newborn as zero', () => {
    expect(calculateAge(localDate('2026-07-30'), localDate('2026-07-30'))).toBe(0);
  });
});

describe('deriveMembership', () => {
  it('derives youth and the youth fee for someone under 18', () => {
    const derived = deriveMembership('2012-05-04', localDate('2026-07-30'));

    expect(derived).toEqual({
      age: 14,
      typeId: 'youth',
      feeEuros: YOUTH_FEE_EUROS,
      requiresGuardian: true,
    });
  });

  it('derives active and the full fee for an adult', () => {
    const derived = deriveMembership('1994-03-14', localDate('2026-07-30'));

    expect(derived).toEqual({
      age: 32,
      typeId: 'active',
      feeEuros: ACTIVE_FEE_EUROS,
      requiresGuardian: false,
    });
  });

  it('switches to active on the eighteenth birthday itself', () => {
    const derived = deriveMembership('2008-07-30', localDate('2026-07-30'));

    expect(derived?.age).toBe(MAJORITY_AGE);
    expect(derived?.typeId).toBe('active');
    expect(derived?.requiresGuardian).toBe(false);
  });

  it('is still youth the day before the eighteenth birthday', () => {
    const derived = deriveMembership('2008-07-30', localDate('2026-07-29'));

    expect(derived?.age).toBe(17);
    expect(derived?.typeId).toBe('youth');
    expect(derived?.requiresGuardian).toBe(true);
  });

  it('has nothing to derive without a usable birth date', () => {
    expect(deriveMembership('', localDate('2026-07-30'))).toBeNull();
    expect(deriveMembership('2026-02-30', localDate('2026-07-30'))).toBeNull();
  });

  it('refuses a birth date in the future', () => {
    expect(deriveMembership('2026-07-31', localDate('2026-07-30'))).toBeNull();
  });

  it('refuses an implausibly old birth date', () => {
    expect(deriveMembership('1880-01-01', localDate('2026-07-30'))).toBeNull();
  });
});
