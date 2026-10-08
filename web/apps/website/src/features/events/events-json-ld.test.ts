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

  it.each<[Partial<Event>, string | undefined, string]>([
    [
      { status: 'fewLeft' },
      'https://schema.org/LimitedAvailability',
      'https://schema.org/EventScheduled',
    ],
    [{ status: 'soldOut' }, 'https://schema.org/SoldOut', 'https://schema.org/EventScheduled'],
    [
      { status: 'presaleScheduled' },
      'https://schema.org/PreOrder',
      'https://schema.org/EventScheduled',
    ],
    [{ status: 'available', priceCents: null }, undefined, 'https://schema.org/EventScheduled'],
    [{ status: 'cancelled' }, undefined, 'https://schema.org/EventCancelled'],
  ])(
    'states the offer and status of an evening with %j',
    (overrides, availability, eventStatus) => {
      const [jsonLd] = buildEventsJsonLd([seasonEvent(overrides)]);

      expect([jsonLd?.offers?.availability, jsonLd?.eventStatus]).toEqual([
        availability,
        eventStatus,
      ]);
    },
  );

  it('omits the door time while it is not published', () => {
    expect(buildEventsJsonLd([seasonEvent({ doorsOpenAt: null })])[0]).not.toHaveProperty(
      'doorTime',
    );
  });
});
