import { describe, expect, it } from 'vitest';
import type { MembershipApplicationForm } from './schemas';
import { buildMembershipApplicationFormSchema, EMPTY_MEMBERSHIP_APPLICATION } from './schemas';

const today = new Date('2026-07-30T12:00');

const schema = buildMembershipApplicationFormSchema(today, 16);

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

const messagesFor = (
  values: MembershipApplicationForm,
  field: string,
  against: typeof schema = schema,
): string[] => {
  const result = against.safeParse(values);

  if (result.success) {
    return [];
  }

  return result.error.issues
    .filter((issue) => issue.path.join('.') === field)
    .map((issue) => issue.message);
};

describe('buildMembershipApplicationFormSchema', () => {
  it('accepts an empty phone', () => {
    const result = schema.safeParse({ ...adult, phone: '' });

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

  it('insists on a five-digit postal code', () => {
    expect(messagesFor({ ...adult, postalCode: '997' }, 'postalCode')).toHaveLength(1);
    expect(messagesFor({ ...adult, postalCode: 'DE99713' }, 'postalCode')).toHaveLength(1);
    expect(schema.safeParse({ ...adult, postalCode: '99713' }).success).toBe(true);
  });

  it('blocks the application until consent is given', () => {
    expect(messagesFor({ ...adult, consent: false }, 'consent')).toHaveLength(1);
    expect(schema.safeParse(adult).success).toBe(true);
  });

  it('refuses a birth date in the future', () => {
    expect(messagesFor({ ...adult, birthDate: '2026-07-31' }, 'birthDate')).toHaveLength(1);
  });

  it('refuses a birth date that cannot belong to a person', () => {
    expect(messagesFor({ ...adult, birthDate: '1880-01-01' }, 'birthDate')).toHaveLength(1);
  });

  it.each([
    ['the day before the sixteenth birthday', '2010-07-31', 1],
    ['on the sixteenth birthday', '2010-07-30', 0],
    ['at seventeen', '2009-05-04', 0],
  ])('holds the birth date against the club’s age of consent %s', (_when, birthDate, issues) => {
    expect(messagesFor({ ...adult, birthDate }, 'birthDate')).toHaveLength(issues);
  });

  it('leaves the age of consent to the API while the club has not said it yet', () => {
    const withoutAge = buildMembershipApplicationFormSchema(today, null);

    expect(messagesFor({ ...adult, birthDate: '2015-05-04' }, 'birthDate', withoutAge)).toEqual([]);
  });
});
