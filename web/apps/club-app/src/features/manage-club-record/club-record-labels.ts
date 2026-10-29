import type { KkSelectOption } from '@furria/ui/KkSelectField';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { WriteLanding } from '@/features/write/landing-target';
import { toLandingKey } from '@/features/write/landing-target';
import type {
  ClubAccessForm,
  ClubContact,
  ClubContactForm,
  ClubIdentity,
  ClubIdentityForm,
  ClubRecord,
  ClubStage,
  ClubStageForm,
} from './schemas';
import { OLDEST_AGE_OF_CONSENT, YOUNGEST_AGE_OF_CONSENT } from './schemas';
import { formatFormMetres, stageSizeOf } from './stage-metres';

export type ClubRecordSection = 'identity' | 'contact' | 'access' | 'stage';

export const CLUB_RECORD_TITLE = 'Vereinsdaten';
export const CLUB_RECORD_LEAD = 'Name, Anschrift, Zugang zur App und Bühne.';
export const CLUB_RECORD_SAVED_MESSAGE = 'Vereinsdaten gespeichert.';
export const MISSING_VALUE = 'nicht hinterlegt';

export const CLUB_RECORD_SECTION_TITLES: Record<ClubRecordSection, string> = {
  identity: 'Name & Gründung',
  contact: 'Anschrift & Kontakt',
  access: 'Zugang zur App',
  stage: 'Bühne',
};

const CLUB_RECORD_PATH = '/manage/club-record';

export const MANAGE_ORIGIN: KkScreenOrigin = { label: 'Verein verwalten', to: '/manage' };
export const CLUB_RECORD_ORIGIN: KkScreenOrigin = {
  label: CLUB_RECORD_TITLE,
  to: CLUB_RECORD_PATH,
};

const LANDING_KIND = 'club-record';

export const toSectionLanding = (section: ClubRecordSection): WriteLanding => ({
  to: CLUB_RECORD_PATH,
  mark: { kind: LANDING_KIND, id: section },
});

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
  `Wer jünger als ${ageOfConsent} ist, wird nicht eingeladen und bewirbt sich nicht online, sondern wird vom Verein direkt aufgenommen.`;

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

export const toClubStageForm = (record: ClubRecord): ClubStageForm => ({
  widthMetres: record.stage === null ? '' : formatFormMetres(record.stage.widthMetres),
  depthMetres: record.stage === null ? '' : formatFormMetres(record.stage.depthMetres),
  artworkSvg: record.stage?.artworkSvg ?? null,
});

export const toClubStage = (form: ClubStageForm): ClubStage | null => {
  const size = stageSizeOf(form.widthMetres, form.depthMetres);

  return size === null ? null : { ...size, artworkSvg: form.artworkSvg };
};

const ARTWORK_MISSING_LINE = 'Noch keine Zeichnung hinterlegt.';
const ARTWORK_PRESENT_LINE = 'Zeichnung hinterlegt.';
const ARTWORK_RELEASE_LINE = 'Zum Hochladen loslassen.';

export const toArtworkFieldLine = (isOver: boolean, hasArtwork: boolean): string => {
  if (isOver) {
    return ARTWORK_RELEASE_LINE;
  }

  return hasArtwork ? ARTWORK_PRESENT_LINE : ARTWORK_MISSING_LINE;
};

export const toStageAreaLabel = (sizeLabel: string): string => `Bühne ${sizeLabel}`;

const ARTWORK_PICK_LABEL = 'SVG-Datei wählen';
const ARTWORK_REPLACE_LABEL = 'Andere Datei wählen';

export const toArtworkPickLabel = (hasArtwork: boolean): string =>
  hasArtwork ? ARTWORK_REPLACE_LABEL : ARTWORK_PICK_LABEL;
