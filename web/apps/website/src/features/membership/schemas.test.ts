import { describe, expect, it } from 'vitest';
import type { MembershipApplicationForm } from './schemas';
import { buildMembershipApplicationFormSchema, EMPTY_MEMBERSHIP_APPLICATION } from './schemas';

const today = new Date('2026-07-30T12:00');

const schema = buildMembershipApplicationFormSchema(today);

const adult: MembershipApplicationForm = {
  ...EMPTY_MEMBERSHIP_APPLICATION,
  firstName: 'Lena',
  lastName: 'Brandt',
  birthDate: '1994-03-14',
  street: 'Hauptstraße 12',
  postalCode: '99713',
  city: 'Großfurra',
  email: 'lena.brandt@example.de',
  consent: true,
};

const minor: MembershipApplicationForm = {
  ...adult,
  firstName: 'Mia',
  birthDate: '2015-05-04',
};

const messagesFor = (values: MembershipApplicationForm, field: string): string[] => {
  const result = schema.safeParse(values);

  if (result.success) {
    return [];
  }

  return result.error.issues
    .filter((issue) => issue.path.join('.') === field)
    .map((issue) => issue.message);
};

describe('buildMembershipApplicationFormSchema', () => {
  it('accepts an empty Telefon and no Gruppen-Interessen', () => {
    const result = schema.safeParse({ ...adult, phone: '', groupInterests: [] });

    expect(result.success).toBe(true);
  });

  it('trims what was typed', () => {
    const result = schema.safeParse({
      ...adult,
      firstName: '  Lena  ',
      email: ' lena@example.de ',
    });

    expect(result.success && result.data.firstName).toBe('Lena');
    expect(result.success && result.data.email).toBe('lena@example.de');
  });

  it('insists on a five-digit Postleitzahl', () => {
    expect(messagesFor({ ...adult, postalCode: '997' }, 'postalCode')).toHaveLength(1);
    expect(messagesFor({ ...adult, postalCode: 'DE99713' }, 'postalCode')).toHaveLength(1);
    expect(schema.safeParse({ ...adult, postalCode: '99713' }).success).toBe(true);
  });

  it('blocks the application until the Einwilligung is given', () => {
    expect(messagesFor({ ...adult, consent: false }, 'consent')).toHaveLength(1);
    expect(schema.safeParse(adult).success).toBe(true);
  });

  it('refuses a Geburtsdatum in the future', () => {
    expect(messagesFor({ ...adult, birthDate: '2026-07-31' }, 'birthDate')).toHaveLength(1);
  });

  it('refuses a Geburtsdatum that cannot belong to a person', () => {
    expect(messagesFor({ ...adult, birthDate: '1880-01-01' }, 'birthDate')).toHaveLength(1);
  });

  it('requires the name of a guardian for someone under 18', () => {
    expect(messagesFor(minor, 'guardianName')).toHaveLength(1);
  });

  it('takes either an e-mail or a phone number from the guardian', () => {
    const withName = { ...minor, guardianName: 'Katrin Brandt' };

    expect(messagesFor(withName, 'guardianEmail')).toHaveLength(1);
    expect(schema.safeParse({ ...withName, guardianEmail: 'k.brandt@example.de' }).success).toBe(
      true,
    );
    expect(schema.safeParse({ ...withName, guardianPhone: '0170 1234567' }).success).toBe(true);
  });

  it('never asks an adult for a guardian', () => {
    expect(messagesFor(adult, 'guardianName')).toHaveLength(0);
    expect(messagesFor(adult, 'guardianEmail')).toHaveLength(0);
  });
});
