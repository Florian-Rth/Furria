export const MAJORITY_AGE = 18;

export const MAX_PLAUSIBLE_AGE = 120;

export const ACTIVE_FEE_EUROS = 30;

export const YOUTH_FEE_EUROS = 15;

export type MembershipTypeId = 'active' | 'youth';

export type ApplicantStanding = 'pending' | 'tooYoung' | 'minor' | 'adult';

export interface DerivedMembership {
  age: number;
  typeId: MembershipTypeId;
  feeEuros: number;
}

const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const parseBirthDate = (value: string): Date | null => {
  const parts = DATE_ONLY_PATTERN.exec(value);

  if (parts === null) {
    return null;
  }

  const year = Number(parts[1]);
  const month = Number(parts[2]);
  const day = Number(parts[3]);
  const parsed = new Date(`${value}T00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  const isSameCalendarDay =
    parsed.getFullYear() === year && parsed.getMonth() + 1 === month && parsed.getDate() === day;

  return isSameCalendarDay ? parsed : null;
};

export const calculateAge = (birthDate: Date, today: Date): number => {
  const yearsBetween = today.getFullYear() - birthDate.getFullYear();
  const birthdayHasPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  return birthdayHasPassed ? yearsBetween : yearsBetween - 1;
};

export const deriveMembership = (birthDate: string, today: Date): DerivedMembership | null => {
  const parsed = parseBirthDate(birthDate);

  if (parsed === null) {
    return null;
  }

  const age = calculateAge(parsed, today);

  if (age < 0 || age > MAX_PLAUSIBLE_AGE) {
    return null;
  }

  const isMinor = age < MAJORITY_AGE;

  return {
    age,
    typeId: isMinor ? 'youth' : 'active',
    feeEuros: isMinor ? YOUTH_FEE_EUROS : ACTIVE_FEE_EUROS,
  };
};

export const deriveApplicantStanding = (
  derived: DerivedMembership | null,
  ageOfConsent: number | null,
): ApplicantStanding => {
  if (derived === null) {
    return 'pending';
  }

  if (ageOfConsent !== null && derived.age < ageOfConsent) {
    return 'tooYoung';
  }

  return derived.age < MAJORITY_AGE ? 'minor' : 'adult';
};
