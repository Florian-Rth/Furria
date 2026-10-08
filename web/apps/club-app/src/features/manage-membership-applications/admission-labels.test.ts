import { describe, expect, it } from 'vitest';
import {
  admissionMembershipShapeOf,
  candidateStandingKindOf,
  toAdmissionQuickChoices,
} from './admission-labels';
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

describe('candidateStandingKindOf', () => {
  it.each([
    { standing: candidate({ isMember: true, membershipState: 'active' }), expected: 'member' },
    { standing: candidate({ membershipState: 'ended' }), expected: 'tied' },
    { standing: candidate({ groups: ['Tanzgarde'] }), expected: 'tied' },
    { standing: candidate({ roles: ['Kassenwartin'] }), expected: 'tied' },
    { standing: candidate({}), expected: 'unaffiliated' },
  ])('reads a candidate as $expected', ({ standing, expected }) => {
    expect(candidateStandingKindOf(standing)).toBe(expected);
  });
});

describe('toAdmissionQuickChoices', () => {
  it.each([
    { today: new Date(2026, 9, 2), expected: ['2026-10-02', '2026-11-11'] },
    { today: new Date(2026, 10, 11), expected: ['2026-11-11', '2027-11-11'] },
    { today: new Date(2027, 0, 15), expected: ['2027-01-15', '2027-11-11'] },
  ])('offers today and the next session opening: $expected', ({ today, expected }) => {
    expect(toAdmissionQuickChoices(today).map((choice) => choice.value)).toEqual(expected);
  });
});

describe('admissionMembershipShapeOf', () => {
  const today = '2026-10-02';

  it.each([
    {
      scenario: 'a new person admitted today',
      candidate: null,
      admittedOn: today,
      expected: { startsLater: false, record: { kind: 'new' } },
    },
    {
      scenario: 'a known person admitted later',
      candidate: candidate({}),
      admittedOn: '2026-11-11',
      expected: { startsLater: true, record: { kind: 'existing' } },
    },
    {
      scenario: 'a former member who keeps her Mitglied seit',
      candidate: candidate({ memberSince: '2017-09-01' }),
      admittedOn: today,
      expected: { startsLater: false, record: { kind: 'continuing', memberSince: '2017-09-01' } },
    },
  ])('shapes $scenario', ({ candidate: chosen, admittedOn, expected }) => {
    expect(
      admissionMembershipShapeOf({
        application: application({}),
        candidate: chosen,
        admittedOn,
        today,
        invitation: 'sent',
      }),
    ).toEqual(expected);
  });
});
