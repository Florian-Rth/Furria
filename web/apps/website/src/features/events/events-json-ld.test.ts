import { describe, expect, it } from 'vitest';
import type { Event } from '@/lib/public-events/schemas';
import { buildEventsJsonLd } from './events-json-ld';

const seasonEvent = (overrides: Partial<Event>): Event => ({
  eventId: 1,
  title: '1. Prunksitzung',
  startsAt: '2027-01-23T19:11',
  endsAt: null,
  doorsOpenAt: '2027-01-23T18:11',
  venue: {
    name: 'Dorfgemeindehaus Großfurra',
    street: 'Schulstraße 4',
    zip: '99713',
    city: 'Großfurra',
    hint: null,
  },
  teaser: 'Ein voller Abend.',
  ageHint: null,
  priceCents: 1400,
  presaleStartsAt: '2026-11-11T11:11',
  status: 'available',
  ...overrides,
});

describe('buildEventsJsonLd', () => {
  it('describes an on-sale evening as a schema.org Event with an offer', () => {
    expect(buildEventsJsonLd([seasonEvent({})])).toEqual([
      {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: '1. Prunksitzung',
        startDate: '2027-01-23T19:11:00+01:00',
        doorTime: '2027-01-23T18:11:00+01:00',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'Place',
          name: 'Dorfgemeindehaus Großfurra',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Schulstraße 4',
            postalCode: '99713',
            addressLocality: 'Großfurra',
            addressCountry: 'DE',
          },
        },
        offers: {
          '@type': 'Offer',
          price: '14.00',
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
        },
      },
    ]);
  });

  it('marks scarce and sold-out evenings honestly', () => {
    const [scarce, soldOut] = buildEventsJsonLd([
      seasonEvent({ status: 'fewLeft' }),
      seasonEvent({ eventId: 2, status: 'soldOut' }),
    ]);

    expect(scarce?.offers?.availability).toBe('https://schema.org/LimitedAvailability');
    expect(soldOut?.offers?.availability).toBe('https://schema.org/SoldOut');
  });

  it('omits the offer and door time while nothing is published', () => {
    const [announced] = buildEventsJsonLd([
      seasonEvent({
        doorsOpenAt: null,
        priceCents: null,
        presaleStartsAt: null,
        status: 'announced',
      }),
    ]);

    expect(announced).not.toHaveProperty('offers');
    expect(announced).not.toHaveProperty('doorTime');
  });

  it('flags a cancelled evening as EventCancelled without an offer', () => {
    const [cancelled] = buildEventsJsonLd([seasonEvent({ status: 'cancelled' })]);

    expect(cancelled?.eventStatus).toBe('https://schema.org/EventCancelled');
    expect(cancelled).not.toHaveProperty('offers');
  });
});
