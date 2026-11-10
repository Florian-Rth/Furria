import { describe, expect, it } from 'vitest';
import type { PublicClub } from '@/lib/public-club/schemas';
import { buildOrganizationJsonLd } from './site-json-ld';

const club = (overrides: Partial<PublicClub>): PublicClub => ({
  name: 'Furrscher Carnevals Club e.V.',
  foundedYear: 1990,
  street: 'Schulstraße 4',
  zip: '99713',
  city: 'Großfurra',
  email: 'info@example.test',
  phone: null,
  websiteUrl: null,
  instagramUrl: 'https://instagram.test/furria',
  facebookUrl: null,
  memberCount: 180,
  groupCount: 9,
  ageOfConsent: 18,
  session: { startYear: 2026, label: '2026/27', motto: null },
  ...overrides,
});

describe('buildOrganizationJsonLd', () => {
  it('describes the club with its address, contact and profiles', () => {
    expect(buildOrganizationJsonLd(club({}))).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Furrscher Carnevals Club e.V.',
      alternateName: 'FURRIA',
      url: 'https://furrscher-carnevals-club.de/',
      logo: 'https://furrscher-carnevals-club.de/apple-touch-icon.png',
      foundingDate: '1990',
      email: 'info@example.test',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Schulstraße 4',
        postalCode: '99713',
        addressLocality: 'Großfurra',
        addressCountry: 'DE',
      },
      sameAs: ['https://instagram.test/furria'],
    });
  });

  it.each<[string, PublicClub | null]>([
    ['an unreachable club read', null],
    ['an incomplete address', club({ street: null, instagramUrl: null })],
  ])('leaves out what is unknown for %s', (_, input) => {
    const jsonLd = buildOrganizationJsonLd(input);

    expect([jsonLd.address, jsonLd.sameAs]).toEqual([undefined, undefined]);
  });
});
