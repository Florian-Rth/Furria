import type { PublicClub } from '@/lib/public-club/schemas';
import { OPERATOR_EMAIL } from './operator-content';
import type { LegalDocument, LegalSection } from './types';

export const imprintContent: LegalDocument = {
  title: 'Impressum',
  sections: [
    {
      heading: 'Angaben gemäß § 5 DDG',
      paragraphs: ['Florian Rätsch', 'Martin-Herrmann-Str. 26', '04249 Leipzig', 'Deutschland'],
    },
    {
      heading: 'Kontakt',
      paragraphs: [`E-Mail: ${OPERATOR_EMAIL}`],
    },
    {
      heading: 'Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV',
      paragraphs: ['Florian Rätsch (Anschrift wie oben)'],
    },
    {
      heading: 'Hinweis zum Betrieb',
      paragraphs: [
        'Diese Website ist ein privates, nicht-kommerzielles Projekt und befindet sich im Aufbau (Vorschau- und Testbetrieb).',
      ],
    },
    {
      heading: 'Haftung für Links',
      paragraphs: [
        'Diese Website enthält derzeit keine Links zu externen Websites Dritter. Sollten künftig Links aufgenommen werden, gilt: Für die Inhalte verlinkter Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.',
      ],
    },
  ],
};

const CLUB_HEADING = 'Verein';
const CLUB_SECTION_AFTER = 3;

const presentOnly = (lines: (string | null)[]): string[] =>
  lines.filter((line): line is string => line !== null && line.trim() !== '');

const labelled = (label: string, value: string | null): string | null =>
  value === null ? null : `${label}: ${value}`;

const placeLineOf = (zip: string | null, city: string | null): string | null => {
  const place = presentOnly([zip, city]).join(' ');

  return place === '' ? null : place;
};

export const toClubSection = (club: PublicClub | undefined): LegalSection | null => {
  if (club === undefined) {
    return null;
  }

  const paragraphs = presentOnly([
    club.name,
    club.street,
    placeLineOf(club.zip, club.city),
    labelled('E-Mail', club.email),
    labelled('Telefon', club.phone),
    labelled('Website', club.websiteUrl),
  ]);

  return paragraphs.length === 0 ? null : { heading: CLUB_HEADING, paragraphs };
};

export const toImprintDocument = (club: PublicClub | undefined): LegalDocument => {
  const clubSection = toClubSection(club);

  if (clubSection === null) {
    return imprintContent;
  }

  return {
    ...imprintContent,
    sections: imprintContent.sections.toSpliced(CLUB_SECTION_AFTER, 0, clubSection),
  };
};
