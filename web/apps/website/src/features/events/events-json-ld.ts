import { formatBerlinIsoWithOffset } from '@/lib/date';
import type { Event, SalesStatus } from '@/lib/seed/events';

const SCHEMA_ORG = 'https://schema.org';

export interface EventJsonLdOffer {
  '@type': 'Offer';
  price: string;
  priceCurrency: 'EUR';
  availability: string;
}

export interface EventJsonLd {
  '@context': typeof SCHEMA_ORG;
  '@type': 'Event';
  name: string;
  startDate: string;
  doorTime?: string;
  eventStatus: string;
  location: { '@type': 'Place'; name: string };
  offers?: EventJsonLdOffer;
}

const CENTS_PER_EURO = 100;

const deriveAvailability = (status: SalesStatus): string | null => {
  switch (status) {
    case 'onSale':
      return `${SCHEMA_ORG}/InStock`;
    case 'almostSoldOut':
      return `${SCHEMA_ORG}/LimitedAvailability`;
    case 'soldOut':
      return `${SCHEMA_ORG}/SoldOut`;
    case 'presaleScheduled':
      return `${SCHEMA_ORG}/PreOrder`;
    case 'announced':
    case 'salesClosed':
    case 'cancelled':
      return null;
  }
};

const deriveOffer = (event: Event): EventJsonLdOffer | undefined => {
  const availability = deriveAvailability(event.salesStatus);
  if (event.priceCents === null || availability === null) {
    return undefined;
  }
  return {
    '@type': 'Offer',
    price: (event.priceCents / CENTS_PER_EURO).toFixed(2),
    priceCurrency: 'EUR',
    availability,
  };
};

export const buildEventJsonLd = (event: Event): EventJsonLd => {
  const offer = deriveOffer(event);
  return {
    '@context': SCHEMA_ORG,
    '@type': 'Event',
    name: event.title,
    startDate: formatBerlinIsoWithOffset(event.startsAt),
    ...(event.doorsOpenAt === null
      ? {}
      : { doorTime: formatBerlinIsoWithOffset(event.doorsOpenAt) }),
    eventStatus:
      event.salesStatus === 'cancelled'
        ? `${SCHEMA_ORG}/EventCancelled`
        : `${SCHEMA_ORG}/EventScheduled`,
    location: { '@type': 'Place', name: event.venue },
    ...(offer === undefined ? {} : { offers: offer }),
  };
};

export const buildEventsJsonLd = (events: Event[]): EventJsonLd[] => events.map(buildEventJsonLd);
