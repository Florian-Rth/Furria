import { describe, expect, it } from 'vitest';
import { buildMembershipApplicationPayload } from './apply-payload';
import type { MembershipApplicationForm } from './schemas';
import { EMPTY_MEMBERSHIP_APPLICATION } from './schemas';

const values: MembershipApplicationForm = {
  ...EMPTY_MEMBERSHIP_APPLICATION,
  firstName: 'Lena',
  lastName: 'Brandt',
  birthDate: '1994-03-14',
  street: 'Hauptstraße 12',
  postalCode: '99713',
  city: 'Großfurra',
  email: 'lena.brandt@example.de',
  phone: '0170 1234567',
  groupInterests: ['tanzgarde', 'organisation'],
  consent: true,
};

describe('buildMembershipApplicationPayload', () => {
  it('carries every entered field to the API', () => {
    expect(buildMembershipApplicationPayload(values, false)).toEqual({
      firstName: 'Lena',
      lastName: 'Brandt',
      birthDate: '1994-03-14',
      street: 'Hauptstraße 12',
      postalCode: '99713',
      city: 'Großfurra',
      email: 'lena.brandt@example.de',
      phone: '0170 1234567',
      groupInterests: ['tanzgarde', 'organisation'],
      guardian: null,
      consentAccepted: true,
    });
  });

  it('sends an unanswered phone as null instead of an empty string', () => {
    expect(buildMembershipApplicationPayload({ ...values, phone: '' }, false).phone).toBeNull();
  });

  it('sends no group interests as an empty list, because that is a normal answer', () => {
    expect(
      buildMembershipApplicationPayload({ ...values, groupInterests: [] }, false).groupInterests,
    ).toEqual([]);
  });

  it('attaches the guardian when one is required', () => {
    const minor = {
      ...values,
      birthDate: '2015-05-04',
      guardianName: 'Katrin Brandt',
      guardianPhone: '0170 7654321',
    };

    expect(buildMembershipApplicationPayload(minor, true).guardian).toEqual({
      name: 'Katrin Brandt',
      email: null,
      phone: '0170 7654321',
    });
  });

  it('never sends guardian data that is not required', () => {
    const withLeftovers = { ...values, guardianName: 'Katrin Brandt' };

    expect(buildMembershipApplicationPayload(withLeftovers, false).guardian).toBeNull();
  });

  it('never sends the honeypot along', () => {
    const payload = buildMembershipApplicationPayload({ ...values, honeypot: 'bot' }, false);

    expect(Object.keys(payload)).not.toContain('honeypot');
  });

  it('never sends a membership type the applicant could have picked', () => {
    const payload = buildMembershipApplicationPayload(values, false);

    expect(Object.keys(payload)).not.toContain('membershipType');
    expect(Object.keys(payload)).not.toContain('feeEuros');
  });
});
