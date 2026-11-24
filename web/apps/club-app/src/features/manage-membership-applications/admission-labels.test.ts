import { describe, expect, it } from 'vitest';
import { admissionMembershipShapeOf } from './admission-labels';
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

describe('admissionMembershipShapeOf', () => {
  const today = '2026-10-02';

  it.each([
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
