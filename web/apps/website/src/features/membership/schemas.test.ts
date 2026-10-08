import { describe, expect, it } from 'vitest';
import type { MembershipApplicationForm } from './schemas';
import { buildMembershipApplicationFormSchema } from './schemas';

const today = new Date('2026-07-30T12:00');

const schema = buildMembershipApplicationFormSchema(today, 16);

const adult: MembershipApplicationForm = {
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

const issueCountFor = (
  values: MembershipApplicationForm,
  field: string,
  against: typeof schema = schema,
): number => {
  const result = against.safeParse(values);

  return result.success
    ? 0
    : result.error.issues.filter((issue) => issue.path.join('.') === field).length;
};

describe('buildMembershipApplicationFormSchema', () => {
  it('trims what was typed', () => {
    const result = schema.safeParse({
      ...adult,
      firstName: '  Lena  ',
      email: ' lena@example.de ',
    });

    expect(result.success && [result.data.firstName, result.data.email]).toEqual([
      'Lena',
      'lena@example.de',
    ]);
  });

  it.each([
    ['997', 1],
    ['00713', 1],
    ['99713', 0],
  ])('holds the postal code %s to five German digits: %i issues', (postalCode, issues) => {
    expect(issueCountFor({ ...adult, postalCode }, 'postalCode')).toBe(issues);
  });

  it.each([
    ['a date in the future', '2026-07-31', 1],
    ['a date no person can be born on', '1880-01-01', 1],
    ['the day before the sixteenth birthday', '2010-07-31', 1],
    ['the sixteenth birthday', '2010-07-30', 0],
  ])('holds the birth date against %s', (_when, birthDate, issues) => {
    expect(issueCountFor({ ...adult, birthDate }, 'birthDate')).toBe(issues);
  });

  it('leaves the age of consent to the API while the club has not said it yet', () => {
    const withoutAge = buildMembershipApplicationFormSchema(today, null);

    expect(issueCountFor({ ...adult, birthDate: '2015-05-04' }, 'birthDate', withoutAge)).toBe(0);
  });
});
