import type { PublicClub } from '@/lib/public-club/schemas';
import { CLUB_LEGAL } from './club-legal';
import { OPERATOR_EMAIL } from './operator-content';
import type { LegalDocument, LegalSection } from './types';

const CONTACT_HEADING = 'Kontakt';

const providerSection: LegalSection = {
  heading: 'Angaben gemäß § 5 DDG',
  paragraphs: [CLUB_LEGAL.name, CLUB_LEGAL.street, CLUB_LEGAL.place],
};

const representationSection: LegalSection = {
  heading: 'Vertreten durch den Vorstand nach § 26 BGB',
  paragraphs: [...CLUB_LEGAL.representatives],
};

const registerSection: LegalSection = {
  heading: 'Registereintrag',
  paragraphs: [
    `Eingetragen im ${CLUB_LEGAL.register}`,
    `Registernummer: ${CLUB_LEGAL.registerNumber}`,
  ],
};

const responsibleSection: LegalSection = {
  heading: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
  paragraphs: [CLUB_LEGAL.contentResponsible],
};

const linksSection: LegalSection = {
  heading: 'Haftung für Links',
  paragraphs: [
    'Diese Website verweist auf Seiten Dritter, etwa auf unsere Auftritte bei Instagram und Facebook. Für deren Inhalte ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Bei der Verlinkung waren keine Rechtsverstöße erkennbar; werden uns solche bekannt, entfernen wir den Link umgehend.',
  ],
};

const presentOnly = (lines: (string | null | undefined)[]): string[] =>
  lines.filter((line): line is string => line !== null && line !== undefined && line.trim() !== '');

const labelled = (label: string, value: string | null | undefined): string | null =>
  value === null || value === undefined || value.trim() === '' ? null : `${label}: ${value}`;

const contactEmailOf = (club: PublicClub | undefined): string => {
  const clubEmail = club?.email?.trim() ?? '';

  return clubEmail === '' ? OPERATOR_EMAIL : clubEmail;
};

export const toContactSection = (club: PublicClub | undefined): LegalSection => ({
  heading: CONTACT_HEADING,
  paragraphs: presentOnly([
    labelled('E-Mail', contactEmailOf(club)),
    labelled('Telefon', club?.phone),
  ]),
});

export const toImprintDocument = (club: PublicClub | undefined): LegalDocument => ({
  title: 'Impressum',
  sections: [
    providerSection,
    representationSection,
    registerSection,
    toContactSection(club),
    responsibleSection,
    linksSection,
  ],
});
