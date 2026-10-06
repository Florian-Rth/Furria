import { describe, expect, it } from 'vitest';
import type { ApplicantStanding, DerivedMembership } from './membership-derivation';
import {
  ACTIVE_FEE_EUROS,
  calculateAge,
  deriveApplicantStanding,
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
    });
  });

  it('derives active and the full fee for an adult', () => {
    const derived = deriveMembership('1994-03-14', localDate('2026-07-30'));

    expect(derived).toEqual({
      age: 32,
      typeId: 'active',
      feeEuros: ACTIVE_FEE_EUROS,
    });
  });

  it('switches to active on the eighteenth birthday itself', () => {
    const derived = deriveMembership('2008-07-30', localDate('2026-07-30'));

    expect(derived?.age).toBe(MAJORITY_AGE);
    expect(derived?.typeId).toBe('active');
  });

  it('is still youth the day before the eighteenth birthday', () => {
    const derived = deriveMembership('2008-07-30', localDate('2026-07-29'));

    expect(derived?.age).toBe(17);
    expect(derived?.typeId).toBe('youth');
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

describe('deriveApplicantStanding', () => {
  const child: DerivedMembership = { age: 14, typeId: 'youth', feeEuros: YOUTH_FEE_EUROS };
  const teen: DerivedMembership = { age: 16, typeId: 'youth', feeEuros: YOUTH_FEE_EUROS };
  const adult: DerivedMembership = { age: 19, typeId: 'active', feeEuros: ACTIVE_FEE_EUROS };

  it.each<[string, DerivedMembership | null, number | null, ApplicantStanding]>([
    ['nobody yet without a birth date', null, 16, 'pending'],
    ['a child under the age of consent', child, 16, 'tooYoung'],
    ['a minor who may apply herself', teen, 16, 'minor'],
    ['an adult', adult, 16, 'adult'],
    ['a child while the age of consent is unknown', child, null, 'minor'],
    ['an adult under a raised age of consent', adult, 21, 'tooYoung'],
  ])('ranks %s', (_case, derived, ageOfConsent, expected) => {
    expect(deriveApplicantStanding(derived, ageOfConsent)).toBe(expected);
  });
});
