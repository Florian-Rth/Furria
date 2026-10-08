import { describe, expect, it } from 'vitest';
import { buildMembershipApplicationPayload } from './apply-payload';
import type { MembershipApplicationForm } from './schemas';

const values: MembershipApplicationForm = {
  firstName: 'Lena',
  lastName: 'Brandt',
  birthDate: '1994-03-14',
  street: 'Hauptstraße 12',
  postalCode: '99713',
  city: 'Großfurra',
  email: 'lena.brandt@example.de',
  phone: '',
  consent: true,
  honeypot: '',
};

describe('buildMembershipApplicationPayload', () => {
  it.each([
    ['', null],
    ['0170 1234567', '0170 1234567'],
  ])('sends the phone %j as %j', (phone, sent) => {
    expect(buildMembershipApplicationPayload({ ...values, phone }, 'eyJ9').phone).toBe(sent);
  });
});
