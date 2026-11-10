import type { PublicClub } from '@/lib/public-club/schemas';
import { absoluteUrlOf, SITE_NAME } from './route-head';

const SCHEMA_ORG = 'https://schema.org';
const OFFICIAL_CLUB_NAME = 'Furrscher Carnevals Club e.V.';
const CLUB_LOGO_PATH = '/apple-touch-icon.png';

export interface PostalAddressJsonLd {
  '@type': 'PostalAddress';
  streetAddress: string;
  postalCode: string;
  addressLocality: string;
  addressCountry: 'DE';
}

export interface OrganizationJsonLd {
  '@context': typeof SCHEMA_ORG;
  '@type': 'Organization';
  name: string;
  alternateName: string;
  url: string;
  logo: string;
  foundingDate?: string;
  email?: string;
  telephone?: string;
  address?: PostalAddressJsonLd;
  sameAs?: string[];
}

export interface WebSiteJsonLd {
  '@context': typeof SCHEMA_ORG;
  '@type': 'WebSite';
  name: string;
  alternateName: string;
  url: string;
  inLanguage: 'de-DE';
}

const addressOf = (club: PublicClub): PostalAddressJsonLd | null =>
  club.street === null || club.zip === null || club.city === null
    ? null
    : {
        '@type': 'PostalAddress',
        streetAddress: club.street,
        postalCode: club.zip,
        addressLocality: club.city,
        addressCountry: 'DE',
      };

const profileUrlsOf = (club: PublicClub): string[] =>
  [club.instagramUrl, club.facebookUrl].filter((url): url is string => url !== null && url !== '');

export const buildOrganizationJsonLd = (club: PublicClub | null): OrganizationJsonLd => {
  const address = club === null ? null : addressOf(club);
  const profileUrls = club === null ? [] : profileUrlsOf(club);

  return {
    '@context': SCHEMA_ORG,
    '@type': 'Organization',
    name: club?.name ?? OFFICIAL_CLUB_NAME,
    alternateName: SITE_NAME,
    url: absoluteUrlOf('/'),
    logo: absoluteUrlOf(CLUB_LOGO_PATH),
    ...(club?.foundedYear == null ? {} : { foundingDate: String(club.foundedYear) }),
    ...(club?.email == null ? {} : { email: club.email }),
    ...(club?.phone == null ? {} : { telephone: club.phone }),
    ...(address === null ? {} : { address }),
    ...(profileUrls.length === 0 ? {} : { sameAs: profileUrls }),
  };
};

export const WEBSITE_JSON_LD: WebSiteJsonLd = {
  '@context': SCHEMA_ORG,
  '@type': 'WebSite',
  name: SITE_NAME,
  alternateName: OFFICIAL_CLUB_NAME,
  url: absoluteUrlOf('/'),
  inLanguage: 'de-DE',
};
