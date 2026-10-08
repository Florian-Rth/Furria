import { describe, expect, it } from 'vitest';
import type { ApplicantStanding, DerivedMembership } from './membership-derivation';
import {
  ACTIVE_FEE_EUROS,
  calculateAge,
  deriveApplicantStanding,
  deriveMembership,
  parseBirthDate,
  YOUTH_FEE_EUROS,
} from './membership-derivation';

const localDate = (value: string): Date => new Date(`${value}T12:00`);

describe('parseBirthDate', () => {
  it('parses a date-only string on the local calendar', () => {
    const parsed = parseBirthDate('2010-01-01');

    expect([parsed?.getFullYear(), parsed?.getMonth(), parsed?.getDate()]).toEqual([2010, 0, 1]);
  });

  it.each([[''], ['14.03.1994'], ['1994-3-14'], ['2026-02-30'], ['2026-13-01']])(
    'rejects %j',
    (value) => {
      expect(parseBirthDate(value)).toBeNull();
    },
  );
});

describe('calculateAge', () => {
  it.each([
    ['2008-07-30', '2026-07-30', 18],
    ['2008-07-30', '2026-07-29', 17],
    ['2008-12-31', '2026-01-01', 17],
    ['2026-07-30', '2026-07-30', 0],
  ])('ages someone born %s at %i on %s', (birthDate, today, age) => {
    expect(calculateAge(localDate(birthDate), localDate(today))).toBe(age);
  });
});

describe('deriveMembership', () => {
  it.each<[string, string, DerivedMembership | null]>([
    ['2008-07-30', '2026-07-30', { age: 18, typeId: 'active', feeEuros: ACTIVE_FEE_EUROS }],
    ['2008-07-30', '2026-07-29', { age: 17, typeId: 'youth', feeEuros: YOUTH_FEE_EUROS }],
    ['', '2026-07-30', null],
    ['2026-07-31', '2026-07-30', null],
    ['1880-01-01', '2026-07-30', null],
  ])('derives the membership of someone born %j on %s', (birthDate, today, derived) => {
    expect(deriveMembership(birthDate, localDate(today))).toEqual(derived);
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
