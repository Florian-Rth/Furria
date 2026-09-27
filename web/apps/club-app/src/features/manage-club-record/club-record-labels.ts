import type { KkScreenOrigin, KkSelectOption } from '@furria/ui';
import { toLandingKey } from '@/features/write';
import type {
  ClubAccessForm,
  ClubContact,
  ClubContactForm,
  ClubIdentity,
  ClubIdentityForm,
  ClubRecord,
} from './schemas';
import { OLDEST_AGE_OF_CONSENT, YOUNGEST_AGE_OF_CONSENT } from './schemas';

export type ClubRecordSection = 'identity' | 'contact' | 'access';

export const CLUB_RECORD_TITLE = 'Vereinsdaten';
export const CLUB_RECORD_SAVED_MESSAGE = 'Vereinsdaten gespeichert.';
export const MISSING_VALUE = 'nicht hinterlegt';

export const CLUB_RECORD_SECTION_TITLES: Record<ClubRecordSection, string> = {
  identity: 'Name & Gründung',
  contact: 'Anschrift & Kontakt',
  access: 'Zugang zur App',
};

export const MANAGE_ORIGIN: KkScreenOrigin = { label: 'Verein verwalten', to: '/manage' };
export const CLUB_RECORD_ORIGIN: KkScreenOrigin = {
  label: CLUB_RECORD_TITLE,
  to: '/manage/club-record',
};

const LANDING_KIND = 'club-record';

export const toSectionLandingKey = (section: ClubRecordSection): string =>
  toLandingKey(LANDING_KIND, section);

const toAgeLabel = (age: number): string => `${age} Jahre`;

export const AGE_OF_CONSENT_OPTIONS: readonly KkSelectOption[] = Array.from(
  { length: OLDEST_AGE_OF_CONSENT - YOUNGEST_AGE_OF_CONSENT + 1 },
  (_, offset) => {
    const age = YOUNGEST_AGE_OF_CONSENT + offset;

    return { value: String(age), label: toAgeLabel(age) };
  },
);

export const toAgeOfConsentLabel = (ageOfConsent: number): string => toAgeLabel(ageOfConsent);

export const toAgeConsequence = (ageOfConsent: string): string =>
  `Wer jünger als ${ageOfConsent} ist, kann nicht eingeladen werden.`;

const toFormText = (value: string | null): string => value ?? '';

const toWritten = (value: string): string | null => (value === '' ? null : value);

export const toClubIdentityForm = (record: ClubRecord): ClubIdentityForm => ({
  name: toFormText(record.name),
  shortName: toFormText(record.shortName),
  foundedYear: record.foundedYear === null ? '' : String(record.foundedYear),
});

export const toClubIdentity = (form: ClubIdentityForm): ClubIdentity => ({
  name: toWritten(form.name),
  shortName: toWritten(form.shortName),
  foundedYear: form.foundedYear === '' ? null : Number(form.foundedYear),
});

export const toClubContactForm = (record: ClubRecord): ClubContactForm => ({
  street: toFormText(record.street),
  zip: toFormText(record.zip),
  city: toFormText(record.city),
  email: toFormText(record.email),
  phone: toFormText(record.phone),
  websiteUrl: toFormText(record.websiteUrl),
  instagramUrl: toFormText(record.instagramUrl),
  facebookUrl: toFormText(record.facebookUrl),
});

export const toClubContact = (form: ClubContactForm): ClubContact => ({
  street: toWritten(form.street),
  zip: toWritten(form.zip),
  city: toWritten(form.city),
  email: toWritten(form.email),
  phone: toWritten(form.phone),
  websiteUrl: toWritten(form.websiteUrl),
  instagramUrl: toWritten(form.instagramUrl),
  facebookUrl: toWritten(form.facebookUrl),
});

export const toClubAccessForm = (record: ClubRecord): ClubAccessForm => ({
  ageOfConsent: String(record.ageOfConsent),
});
