import { describe, expect, it } from 'vitest';
import type { Event, EventFacts } from '@/lib/seed/events';
import { buildCancelledEvent, buildEvent } from '@/lib/seed/events';
import { buildEventsJsonLd } from './events-json-ld';

const SNAPSHOT_AT = new Date('2026-12-01T12:00');

const baseFacts: EventFacts = {
  id: 'prunksitzung-1-2027',
  title: '1. Prunksitzung',
  type: 'Prunksitzung',
  venue: 'Dorfgemeindehaus Großfurra',
  startsAt: '2027-01-23T19:11',
  doorsOpenAt: '2027-01-23T18:11',
  teaser: 'Ein voller Abend.',
  ageHint: 'ab 12 Jahren empfohlen',
  priceCents: 1400,
  capacity: 260,
  presaleStartsAt: '2026-11-11T11:11',
  presaleEndsAt: null,
  freeCount: 74,
};

const seasonEvent = (overrides: Partial<EventFacts>): Event =>
  buildEvent({ ...baseFacts, ...overrides }, SNAPSHOT_AT);

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
        location: { '@type': 'Place', name: 'Dorfgemeindehaus Großfurra' },
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
      seasonEvent({ freeCount: 18 }),
      seasonEvent({ id: 'sold-out', freeCount: 0 }),
    ]);

    expect(scarce?.offers?.availability).toBe('https://schema.org/LimitedAvailability');
    expect(soldOut?.offers?.availability).toBe('https://schema.org/SoldOut');
  });

  it('omits the offer and door time while nothing is published', () => {
    const [announced] = buildEventsJsonLd([
      seasonEvent({
        doorsOpenAt: null,
        priceCents: null,
        capacity: null,
        freeCount: null,
        presaleStartsAt: null,
      }),
    ]);

    expect(announced).not.toHaveProperty('offers');
    expect(announced).not.toHaveProperty('doorTime');
  });

  it('flags a cancelled evening as EventCancelled without an offer', () => {
    const [cancelled] = buildEventsJsonLd([buildCancelledEvent(baseFacts)]);

    expect(cancelled?.eventStatus).toBe('https://schema.org/EventCancelled');
    expect(cancelled).not.toHaveProperty('offers');
  });
});
