import { describe, expect, it } from 'vitest';
import {
  findChosenCandidate,
  NEW_PERSON_CHOICE,
  toAdmissionRequest,
  toAgeOn,
  toInitialChoice,
  toInvitationForecast,
  toInvitedAddress,
} from './admission';
import type { AdmissionCandidate, MembershipApplicationDetails } from './schemas';

const application = (
  overrides: Partial<MembershipApplicationDetails>,
): MembershipApplicationDetails => ({
  membershipApplicationId: 7,
  firstName: 'Mia',
  lastName: 'Schwarzwälder',
  birthDate: '1996-04-03',
  age: 30,
  isMinor: false,
  street: 'Rosenweg 12a',
  zip: '50667',
  city: 'Köln',
  email: 'mia@example.com',
  phone: null,
  submittedAt: '2026-09-29T08:00:00+00:00',
  confirmedAt: '2026-09-29T08:05:00+00:00',
  appliedOn: '2026-09-29',
  ageOfConsent: 16,
  candidates: [],
  ...overrides,
});

const candidate = (overrides: Partial<AdmissionCandidate>): AdmissionCandidate => ({
  personId: 12,
  firstName: 'Mia',
  lastName: 'Schwarzwälder',
  birthDate: null,
  email: null,
  city: null,
  membershipState: 'none',
  memberSince: null,
  isMember: false,
  groups: [],
  roles: [],
  hasAccount: false,
  isAffiliated: false,
  gaps: [],
  ...overrides,
});

describe('toAgeOn', () => {
  it.each([
    { birthDate: '2008-10-02', day: '2026-10-02', expected: 18 },
    { birthDate: '2008-10-02', day: '2026-10-01', expected: 17 },
    { birthDate: '2008-02-29', day: '2026-02-28', expected: 18 },
    { birthDate: '2008-02-29', day: '2028-02-28', expected: 19 },
    { birthDate: '2008-12-31', day: '2027-01-01', expected: 18 },
  ])('is $expected on $day when born on $birthDate', ({ birthDate, day, expected }) => {
    expect(toAgeOn(birthDate, day)).toBe(expected);
  });
});

describe('toInitialChoice', () => {
  it('chooses a new person when nobody in the registry matches', () => {
    expect(toInitialChoice([])).toBe(NEW_PERSON_CHOICE);
  });

  it('leaves the choice open when someone in the registry matches', () => {
    expect(toInitialChoice([candidate({})])).toBeNull();
  });
});

describe('findChosenCandidate', () => {
  it('finds the candidate the choice names', () => {
    const lena = candidate({ personId: 13, firstName: 'Lena' });

    expect(findChosenCandidate('13', [candidate({}), lena])).toBe(lena);
  });

  it.each([{ choice: NEW_PERSON_CHOICE }, { choice: null }])(
    'finds nobody for the choice $choice',
    ({ choice }) => {
      expect(findChosenCandidate(choice, [candidate({})])).toBeNull();
    },
  );
});

describe('toAdmissionRequest', () => {
  it('asks for a new person when she is not in the registry', () => {
    expect(
      toAdmissionRequest({
        choice: NEW_PERSON_CHOICE,
        admittedOn: '2026-10-02',
        guardianConsentConfirmed: false,
        appliedOn: '2026-09-29',
        birthDate: '1996-04-03',
      }),
    ).toEqual({ personId: null, admittedOn: '2026-10-02', guardianConsentConfirmed: false });
  });

  it('names the person the admitter picked', () => {
    expect(
      toAdmissionRequest({
        choice: '12',
        admittedOn: '2026-10-02',
        guardianConsentConfirmed: true,
        appliedOn: '2026-09-29',
        birthDate: '2009-03-12',
      }),
    ).toEqual({ personId: 12, admittedOn: '2026-10-02', guardianConsentConfirmed: true });
  });

  it('sends nothing while no choice is made', () => {
    expect(
      toAdmissionRequest({
        choice: null,
        admittedOn: '2026-10-02',
        guardianConsentConfirmed: false,
        appliedOn: '2026-09-29',
        birthDate: '1996-04-03',
      }),
    ).toBeNull();
  });
});

describe('toInvitationForecast', () => {
  const today = '2026-10-02';

  it.each([
    {
      scenario: 'a new person admitted today',
      chosen: null,
      admittedOn: today,
      expected: 'sent',
    },
    {
      scenario: 'a new person admitted later',
      chosen: null,
      admittedOn: '2026-11-11',
      expected: 'notYetAffiliated',
    },
    {
      scenario: 'a person already in a group admitted later',
      chosen: candidate({ isAffiliated: true }),
      admittedOn: '2026-11-11',
      expected: 'sent',
    },
    {
      scenario: 'a person with an account',
      chosen: candidate({ hasAccount: true, isAffiliated: true }),
      admittedOn: today,
      expected: 'alreadyHasAccount',
    },
    {
      scenario: 'a person the registry knows to be 15',
      chosen: candidate({ birthDate: '2011-06-01' }),
      admittedOn: today,
      expected: 'belowAgeOfConsent',
    },
  ] as const)('forecasts $expected for $scenario', ({ chosen, admittedOn, expected }) => {
    expect(
      toInvitationForecast({ application: application({}), candidate: chosen, admittedOn, today }),
    ).toBe(expected);
  });
});

describe('toInvitedAddress', () => {
  it('invites to the address the registry holds', () => {
    expect(toInvitedAddress(application({}), candidate({ email: 'familie@example.com' }))).toBe(
      'familie@example.com',
    );
  });

  it.each([{ email: null }, { email: ' ' }])(
    'invites to the address she applied with when the registry holds $email',
    ({ email }) => {
      expect(toInvitedAddress(application({}), candidate({ email }))).toBe('mia@example.com');
    },
  );
});
