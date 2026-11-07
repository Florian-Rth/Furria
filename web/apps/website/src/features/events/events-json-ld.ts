import { formatBerlinIsoWithOffset } from '@/lib/date';
import type { Event, SalesStatus } from '@/lib/public-events/schemas';
import { absoluteUrlOf } from '@/lib/seo/route-head';
import { buildEventHref } from './event-display';

const SCHEMA_ORG = 'https://schema.org';

export interface EventJsonLdOffer {
  '@type': 'Offer';
  price: string;
  priceCurrency: 'EUR';
  availability: string;
  url: string;
}

export interface EventJsonLdAddress {
  '@type': 'PostalAddress';
  streetAddress: string;
  postalCode: string;
  addressLocality: string;
  addressCountry: 'DE';
}

export interface EventJsonLd {
  '@context': typeof SCHEMA_ORG;
  '@type': 'Event';
  name: string;
  description: string;
  url: string;
  image?: string[];
  startDate: string;
  endDate?: string;
  doorTime?: string;
  eventStatus: string;
  eventAttendanceMode: string;
  location: { '@type': 'Place'; name: string; address: EventJsonLdAddress };
  organizer: { '@type': 'Organization'; name: string; url: string };
  offers?: EventJsonLdOffer;
}

const CENTS_PER_EURO = 100;
const ORGANIZER_NAME = 'Furrscher Carnevals Club e.V.';

const deriveAvailability = (status: SalesStatus): string | null => {
  switch (status) {
    case 'available':
      return `${SCHEMA_ORG}/InStock`;
    case 'fewLeft':
      return `${SCHEMA_ORG}/LimitedAvailability`;
    case 'soldOut':
      return `${SCHEMA_ORG}/SoldOut`;
    case 'presaleScheduled':
      return `${SCHEMA_ORG}/PreOrder`;
    case 'announced':
    case 'cancelled':
      return null;
  }
};

const deriveOffer = (event: Event): EventJsonLdOffer | undefined => {
  const availability = deriveAvailability(event.status);
  if (event.priceCents === null || availability === null) {
    return undefined;
  }
  return {
    '@type': 'Offer',
    price: (event.priceCents / CENTS_PER_EURO).toFixed(2),
    priceCurrency: 'EUR',
    availability,
    url: absoluteUrlOf(buildEventHref(event)),
  };
};

export const buildEventJsonLd = (event: Event): EventJsonLd => {
  const offer = deriveOffer(event);
  return {
    '@context': SCHEMA_ORG,
    '@type': 'Event',
    name: event.title,
    description: event.teaser,
    url: absoluteUrlOf(buildEventHref(event)),
    ...(event.picture === null ? {} : { image: [absoluteUrlOf(event.picture.largeUrl)] }),
    startDate: formatBerlinIsoWithOffset(event.startsAt),
    ...(event.endsAt === null ? {} : { endDate: formatBerlinIsoWithOffset(event.endsAt) }),
    ...(event.doorsOpenAt === null
      ? {}
      : { doorTime: formatBerlinIsoWithOffset(event.doorsOpenAt) }),
    eventStatus:
      event.status === 'cancelled'
        ? `${SCHEMA_ORG}/EventCancelled`
        : `${SCHEMA_ORG}/EventScheduled`,
    eventAttendanceMode: `${SCHEMA_ORG}/OfflineEventAttendanceMode`,
    location: {
      '@type': 'Place',
      name: event.venue.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.venue.street,
        postalCode: event.venue.zip,
        addressLocality: event.venue.city,
        addressCountry: 'DE',
      },
    },
    organizer: { '@type': 'Organization', name: ORGANIZER_NAME, url: absoluteUrlOf('/') },
    ...(offer === undefined ? {} : { offers: offer }),
  };
};

export const buildEventsJsonLd = (events: Event[]): EventJsonLd[] => events.map(buildEventJsonLd);
