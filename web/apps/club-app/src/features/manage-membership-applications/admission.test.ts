import { describe, expect, it } from 'vitest';
import { toAgeOn, toInvitationForecast, toInvitedAddress } from './admission';
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
    { birthDate: '2008-10-02', day: '2026-10-01', expected: 17 },
    { birthDate: '2008-02-29', day: '2026-02-28', expected: 18 },
    { birthDate: '2008-02-29', day: '2028-02-28', expected: 19 },
  ])('is $expected on $day when born on $birthDate', ({ birthDate, day, expected }) => {
    expect(toAgeOn(birthDate, day)).toBe(expected);
  });
});

describe('toInvitationForecast', () => {
  const today = '2026-10-02';

  it.each([
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
  it.each([{ email: null }, { email: ' ' }])(
    'invites to the address she applied with when the registry holds $email',
    ({ email }) => {
      expect(toInvitedAddress(application({}), candidate({ email }))).toBe('mia@example.com');
    },
  );
});
