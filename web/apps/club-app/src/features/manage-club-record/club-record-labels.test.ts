import { describe, expect, it } from 'vitest';
import {
  toClubContact,
  toClubContactForm,
  toClubIdentity,
  toClubIdentityForm,
} from './club-record-labels';
import { ClubIdentityFormSchema, isWebLinkOrEmpty } from './schemas';

const emptyRecord = {
  name: null,
  shortName: null,
  foundedYear: null,
  street: null,
  zip: null,
  city: null,
  email: null,
  phone: null,
  websiteUrl: null,
  instagramUrl: null,
  facebookUrl: null,
  ageOfConsent: 16,
};

describe('toClubIdentityForm', () => {
  it.each([
    { foundedYear: 1971, expected: '1971' },
    { foundedYear: null, expected: '' },
  ])('turns founded year $foundedYear into "$expected"', ({ foundedYear, expected }) => {
    expect(toClubIdentityForm({ ...emptyRecord, name: 'GCC e.V.', foundedYear })).toEqual({
      name: 'GCC e.V.',
      shortName: '',
      foundedYear: expected,
    });
  });
});

describe('toClubIdentity', () => {
  it.each([
    {
      form: { name: 'GCC e.V.', shortName: 'GCC', foundedYear: '1971' },
      expected: { name: 'GCC e.V.', shortName: 'GCC', foundedYear: 1971 },
    },
    {
      form: { name: '', shortName: '', foundedYear: '' },
      expected: { name: null, shortName: null, foundedYear: null },
    },
  ])('reads $form as $expected', ({ form, expected }) => {
    expect(toClubIdentity(form)).toEqual(expected);
  });
});

describe('toClubContact', () => {
  it('writes empty fields as absent', () => {
    const form = { ...toClubContactForm(emptyRecord), email: 'vorstand@furria.de' };

    expect(toClubContact(form)).toEqual({
      street: null,
      zip: null,
      city: null,
      email: 'vorstand@furria.de',
      phone: null,
      websiteUrl: null,
      instagramUrl: null,
      facebookUrl: null,
    });
  });
});

describe('ClubIdentityFormSchema', () => {
  it('trims the fields', () => {
    expect(
      ClubIdentityFormSchema.parse({
        name: ' GCC e.V. ',
        shortName: ' GCC',
        foundedYear: ' 1971 ',
      }),
    ).toEqual({ name: 'GCC e.V.', shortName: 'GCC', foundedYear: '1971' });
  });
});

describe('isWebLinkOrEmpty', () => {
  it.each([
    { value: '', expected: true },
    { value: 'https://furria.de', expected: true },
    { value: 'http://furria.de', expected: true },
    { value: 'furria.de', expected: false },
    { value: 'ftp://furria.de', expected: false },
    { value: 'javascript:alert(1)', expected: false },
  ])('judges "$value" as $expected', ({ value, expected }) => {
    expect(isWebLinkOrEmpty(value)).toBe(expected);
  });
});
