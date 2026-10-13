import { describe, expect, it } from 'vitest';
import type { PublicClub } from '@/lib/public-club/schemas';
import { imprintContent, toClubSection, toImprintDocument } from './imprint-content';

const clubOf = (record: Partial<PublicClub>): PublicClub => ({
  name: null,
  foundedYear: null,
  street: null,
  zip: null,
  city: null,
  email: null,
  phone: null,
  websiteUrl: null,
  instagramUrl: null,
  facebookUrl: null,
  memberCount: 0,
  groupCount: 0,
  ageOfConsent: 16,
  session: { startYear: 2026, label: '2026/27', motto: null },
  ...record,
});

describe('toClubSection', () => {
  it.each([
    {
      record: {
        name: 'FCC',
        street: 'Hauptstraße 1',
        zip: '99706',
        city: 'Großfurra',
        email: 'vorstand@furria.de',
        phone: '036334 12345',
        websiteUrl: 'https://furria.de',
      },
      expected: [
        'FCC',
        'Hauptstraße 1',
        '99706 Großfurra',
        'E-Mail: vorstand@furria.de',
        'Telefon: 036334 12345',
        'Website: https://furria.de',
      ],
    },
    { record: { name: 'FCC', city: 'Großfurra' }, expected: ['FCC', 'Großfurra'] },
    { record: { street: '  ' }, expected: null },
    { record: {}, expected: null },
  ])('lists the recorded lines $expected', ({ record, expected }) => {
    expect(toClubSection(clubOf(record))?.paragraphs ?? null).toEqual(expected);
  });

  it('has no section while the club is loading', () => {
    expect(toClubSection(undefined)).toBeNull();
  });
});

describe('toImprintDocument', () => {
  it('places the club after the responsible person and before the operation note', () => {
    const imprint = toImprintDocument(clubOf({ name: 'FCC' }));

    expect(imprint.sections.length).toBe(imprintContent.sections.length + 1);
    expect(imprint.sections[3]?.paragraphs).toEqual(['FCC']);
  });

  it('keeps the fixed imprint when the club recorded nothing', () => {
    expect(toImprintDocument(clubOf({}))).toBe(imprintContent);
  });
});
