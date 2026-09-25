import { z } from 'zod';

export const EARLIEST_FOUNDED_YEAR = 1800;
export const LATEST_FOUNDED_YEAR = 2100;
export const YOUNGEST_AGE_OF_CONSENT = 12;
export const OLDEST_AGE_OF_CONSENT = 21;

const NAME_MAX = 160;
const SHORT_NAME_MAX = 40;
const STREET_MAX = 120;
const ZIP_MAX = 16;
const CITY_MAX = 80;
const EMAIL_MAX = 256;
const PHONE_MAX = 64;
const LINK_MAX = 256;

const FOUNDED_YEAR_MESSAGE = `Gib ein Jahr zwischen ${EARLIEST_FOUNDED_YEAR} und ${LATEST_FOUNDED_YEAR} ein.`;
const AGE_OF_CONSENT_MESSAGE = `Wähle ein Alter zwischen ${YOUNGEST_AGE_OF_CONSENT} und ${OLDEST_AGE_OF_CONSENT} Jahren.`;
const EMAIL_MESSAGE = 'Bitte gib eine gültige E-Mail-Adresse ein.';
const WEB_LINK_MESSAGE = 'Gib eine vollständige Adresse mit https:// ein.';
const FOUNDED_YEAR_PATTERN = /^\d{4}$/;
const AGE_PATTERN = /^\d{2}$/;
const WEB_LINK_PROTOCOLS: ReadonlySet<string> = new Set(['https:', 'http:']);

const isFoundedYearOrEmpty = (value: string): boolean => {
  if (value === '') {
    return true;
  }
  const year = Number(value);

  return (
    FOUNDED_YEAR_PATTERN.test(value) && year >= EARLIEST_FOUNDED_YEAR && year <= LATEST_FOUNDED_YEAR
  );
};

const isAgeInRange = (value: string): boolean => {
  const age = Number(value);

  return AGE_PATTERN.test(value) && age >= YOUNGEST_AGE_OF_CONSENT && age <= OLDEST_AGE_OF_CONSENT;
};

const isEmailOrEmpty = (value: string): boolean =>
  value === '' || z.email().safeParse(value).success;

export const isWebLinkOrEmpty = (value: string): boolean =>
  value === '' || (URL.canParse(value) && WEB_LINK_PROTOCOLS.has(new URL(value).protocol));

const webLink = z.string().trim().max(LINK_MAX).refine(isWebLinkOrEmpty, WEB_LINK_MESSAGE);

export const ClubRecordSchema = z.object({
  name: z.string().nullable(),
  shortName: z.string().nullable(),
  foundedYear: z.number().int().nullable(),
  street: z.string().nullable(),
  zip: z.string().nullable(),
  city: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  instagramUrl: z.string().nullable(),
  facebookUrl: z.string().nullable(),
  ageOfConsent: z.number().int(),
});
export type ClubRecord = z.infer<typeof ClubRecordSchema>;

export type ClubIdentity = Pick<ClubRecord, 'name' | 'shortName' | 'foundedYear'>;
export type ClubContact = Pick<
  ClubRecord,
  'street' | 'zip' | 'city' | 'email' | 'phone' | 'websiteUrl' | 'instagramUrl' | 'facebookUrl'
>;

export const ClubIdentityFormSchema = z.object({
  name: z.string().trim().max(NAME_MAX),
  shortName: z.string().trim().max(SHORT_NAME_MAX),
  foundedYear: z.string().trim().refine(isFoundedYearOrEmpty, FOUNDED_YEAR_MESSAGE),
});
export type ClubIdentityForm = z.infer<typeof ClubIdentityFormSchema>;

export const ClubContactFormSchema = z.object({
  street: z.string().trim().max(STREET_MAX),
  zip: z.string().trim().max(ZIP_MAX),
  city: z.string().trim().max(CITY_MAX),
  email: z.string().trim().max(EMAIL_MAX).refine(isEmailOrEmpty, EMAIL_MESSAGE),
  phone: z.string().trim().max(PHONE_MAX),
  websiteUrl: webLink,
  instagramUrl: webLink,
  facebookUrl: webLink,
});
export type ClubContactForm = z.infer<typeof ClubContactFormSchema>;

export const ClubAccessFormSchema = z.object({
  ageOfConsent: z.string().refine(isAgeInRange, AGE_OF_CONSENT_MESSAGE),
});
export type ClubAccessForm = z.infer<typeof ClubAccessFormSchema>;
