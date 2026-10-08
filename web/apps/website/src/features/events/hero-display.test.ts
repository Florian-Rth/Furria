import { describe, expect, it } from 'vitest';
import type { Event } from '@/lib/public-events/schemas';
import type { HeroFacts } from './hero-display';
import { deriveHeroFacts, deriveHeroSessionLabel } from './hero-display';

const seasonEvent = (overrides: Partial<Event>): Event => ({
  eventId: 1,
  title: '1. Prunksitzung',
  startsAt: '2027-01-23T19:11',
  endsAt: null,
  doorsOpenAt: '2027-01-23T18:11',
  venue: { name: 'Dorfgemeindehaus', street: '', zip: '', city: '', hint: null },
  teaser: 'Ein voller Abend.',
  ageHint: null,
  priceCents: 1400,
  presaleStartsAt: '2026-11-11T11:11',
  status: 'available',
  ...overrides,
});

const festplatz = { name: 'Festplatz', street: '', zip: '', city: '', hint: null };

describe('deriveHeroSessionLabel', () => {
  it.each<[string, Event[], Date, string]>([
    ['the earliest evening', [seasonEvent({})], new Date('2026-08-14T12:00'), '2026/27'],
    ['the running Session without evenings', [], new Date('2026-08-14T12:00'), '2025/26'],
  ])('derives the Session from %s', (_, events, now, label) => {
    expect(deriveHeroSessionLabel(events, now)).toBe(label);
  });
});

describe('deriveHeroFacts', () => {
  it.each<[string, Event[], HeroFacts | null]>([
    [
      'evenings at one venue, the cheapest known price',
      [
        seasonEvent({ eventId: 3, startsAt: '2027-02-07T14:11', priceCents: null }),
        seasonEvent({ eventId: 2, startsAt: '2027-01-30T19:11', priceCents: 1000 }),
        seasonEvent({}),
      ],
      {
        eveningCount: 3,
        sharedVenueName: 'Dorfgemeindehaus',
        firstStartsAt: '2027-01-23T19:11',
        lastStartsAt: '2027-02-07T14:11',
        cheapestPriceCents: 1000,
      },
    ],
    [
      'evenings at different venues without a price',
      [
        seasonEvent({ priceCents: null }),
        seasonEvent({ eventId: 2, venue: festplatz, priceCents: null }),
      ],
      {
        eveningCount: 2,
        sharedVenueName: null,
        firstStartsAt: '2027-01-23T19:11',
        lastStartsAt: '2027-01-23T19:11',
        cheapestPriceCents: null,
      },
    ],
    ['only cancelled evenings', [seasonEvent({ status: 'cancelled' })], null],
  ])('sums up %s', (_, events, facts) => {
    expect(deriveHeroFacts(events)).toEqual(facts);
  });
});
