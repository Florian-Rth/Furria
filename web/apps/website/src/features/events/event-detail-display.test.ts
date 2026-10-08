import { describe, expect, it } from 'vitest';
import type { Event, EventVenue } from '@/lib/public-events/schemas';
import type { EventStatKind, VenueFactKind } from './event-detail-display';
import { deriveEventStats, deriveVenueFacts } from './event-detail-display';

const eveningWith = (overrides: Partial<Event>): Event => ({
  eventId: 1,
  title: '1. Prunksitzung',
  startsAt: '2027-01-23T19:11',
  endsAt: '2027-01-24T01:00',
  doorsOpenAt: '2027-01-23T18:11',
  venue: { name: 'Dorfgemeindehaus', street: '', zip: '', city: '', hint: null },
  teaser: 'Ein voller Abend.',
  ageHint: 'ab 12 Jahren',
  priceCents: 1400,
  presaleStartsAt: '2026-11-11T11:11',
  status: 'available',
  ...overrides,
});

describe('deriveEventStats', () => {
  it.each<[string, Partial<Event>, EventStatKind[]]>([
    ['everything is known', {}, ['date', 'doors', 'start', 'price', 'age']],
    [
      'doors, price and age hint are unknown',
      { doorsOpenAt: null, priceCents: null, ageHint: null },
      ['date', 'start'],
    ],
  ])('states the known facts when %s, never an end time', (_, overrides, kinds) => {
    expect(deriveEventStats(eveningWith(overrides)).map((stat) => stat.kind)).toEqual(kinds);
  });
});

describe('deriveVenueFacts', () => {
  it.each<[EventVenue, [VenueFactKind, string][]]>([
    [
      {
        name: 'Dorfgemeindehaus',
        street: 'Schulstraße 4',
        zip: '99713',
        city: 'Großfurra',
        hint: 'Eingang über den Hof',
      },
      [
        ['address', 'Schulstraße 4, 99713 Großfurra'],
        ['hint', 'Eingang über den Hof'],
      ],
    ],
    [
      { name: 'Festplatz', street: '', zip: '', city: 'Großfurra', hint: null },
      [['address', 'Großfurra']],
    ],
    [{ name: 'Irgendwo', street: '', zip: '', city: '', hint: null }, []],
  ])('lists the facts of %j', (venue, facts) => {
    expect(deriveVenueFacts(venue).map((fact) => [fact.kind, fact.value])).toEqual(facts);
  });
});
