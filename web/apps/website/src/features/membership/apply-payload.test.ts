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
  consent: true,
};

const ALTCHA = 'eyJjaGFsbGVuZ2UiOnt9fQ==';

describe('buildMembershipApplicationPayload', () => {
  it('carries every entered field to the API', () => {
    expect(buildMembershipApplicationPayload(values, ALTCHA)).toEqual({
      firstName: 'Lena',
      lastName: 'Brandt',
      birthDate: '1994-03-14',
      street: 'Hauptstraße 12',
      postalCode: '99713',
      city: 'Großfurra',
      email: 'lena.brandt@example.de',
      phone: '0170 1234567',
      consentAccepted: true,
      altcha: ALTCHA,
    });
  });

  it('sends an unanswered phone as null instead of an empty string', () => {
    expect(buildMembershipApplicationPayload({ ...values, phone: '' }, ALTCHA).phone).toBeNull();
  });

  it('never sends the honeypot along', () => {
    const payload = buildMembershipApplicationPayload({ ...values, honeypot: 'bot' }, ALTCHA);

    expect(Object.keys(payload)).not.toContain('honeypot');
  });

  it('never sends a membership type the applicant could have picked', () => {
    const payload = buildMembershipApplicationPayload(values, ALTCHA);

    expect(Object.keys(payload)).not.toContain('membershipType');
    expect(Object.keys(payload)).not.toContain('feeEuros');
  });
});
