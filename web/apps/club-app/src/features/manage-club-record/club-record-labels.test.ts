import { describe, expect, it } from 'vitest';
import {
  toClubContact,
  toClubContactForm,
  toClubIdentity,
  toClubIdentityForm,
  toClubStage,
  toClubStageForm,
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
  stage: null,
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
    { value: 'furria.de', expected: false },
    { value: 'ftp://furria.de', expected: false },
  ])('judges "$value" as $expected', ({ value, expected }) => {
    expect(isWebLinkOrEmpty(value)).toBe(expected);
  });
});

describe('toClubStageForm', () => {
  it.each([
    { stage: null, expected: { widthMetres: '', depthMetres: '', artworkSvg: null } },
    {
      stage: { widthMetres: 12.5, depthMetres: 8, artworkSvg: '<svg/>' },
      expected: { widthMetres: '12,5', depthMetres: '8', artworkSvg: '<svg/>' },
    },
    {
      stage: { widthMetres: 10.25, depthMetres: 6.4, artworkSvg: null },
      expected: { widthMetres: '10,25', depthMetres: '6,4', artworkSvg: null },
    },
  ])('turns stage $stage into $expected', ({ stage, expected }) => {
    expect(toClubStageForm({ ...emptyRecord, stage })).toEqual(expected);
  });
});

describe('toClubStage', () => {
  it.each([
    {
      form: { widthMetres: '12,5', depthMetres: '8', artworkSvg: '<svg/>' },
      expected: { widthMetres: 12.5, depthMetres: 8, artworkSvg: '<svg/>' },
    },
    {
      form: { widthMetres: '10.25', depthMetres: ' 6,40 ', artworkSvg: null },
      expected: { widthMetres: 10.25, depthMetres: 6.4, artworkSvg: null },
    },
    { form: { widthMetres: '', depthMetres: '8', artworkSvg: null }, expected: null },
    { form: { widthMetres: '1,5', depthMetres: '8', artworkSvg: null }, expected: null },
    { form: { widthMetres: '12', depthMetres: '41', artworkSvg: null }, expected: null },
    { form: { widthMetres: '12,345', depthMetres: '8', artworkSvg: null }, expected: null },
  ])('turns form $form into $expected', ({ form, expected }) => {
    expect(toClubStage(form)).toEqual(expected);
  });

  it.each([
    { widthMetres: 12.5, depthMetres: 8 },
    { widthMetres: 10.25, depthMetres: 6.4 },
    { widthMetres: 2, depthMetres: 40 },
  ])('keeps $widthMetres × $depthMetres through the form', (size) => {
    const stage = { ...size, artworkSvg: null };

    expect(toClubStage(toClubStageForm({ ...emptyRecord, stage }))).toEqual(stage);
  });
});
