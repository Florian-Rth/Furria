import { describe, expect, it } from 'vitest';
import type { Event } from '@/lib/public-events/schemas';
import { deriveHeroIntro, deriveHeroStats, deriveSessionEyebrow } from './hero-display';

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

const threeEvenings = (): Event[] => [
  seasonEvent({}),
  seasonEvent({ eventId: 2, startsAt: '2027-01-30T19:11', priceCents: 1000 }),
  seasonEvent({
    eventId: 3,
    startsAt: '2027-02-07T14:11',
    doorsOpenAt: null,
    priceCents: null,
    presaleStartsAt: null,
    status: 'announced',
  }),
];

describe('deriveSessionEyebrow', () => {
  it('derives the Session from the earliest evening', () => {
    expect(deriveSessionEyebrow(threeEvenings(), new Date('2026-08-14T12:00'))).toBe(
      'TERMINE & KARTEN · SESSION 2026/27',
    );
  });

  it('falls back to the running Session when no evening exists', () => {
    expect(deriveSessionEyebrow([], new Date('2026-11-30T12:00'))).toBe(
      'TERMINE & KARTEN · SESSION 2026/27',
    );
  });
});

describe('deriveHeroIntro', () => {
  it('states count, shared venue and date span', () => {
    expect(deriveHeroIntro(threeEvenings())).toBe(
      'Drei Abende im Dorfgemeindehaus Großfurra, vom 23. Januar 2027 bis zum 7. Februar 2027.',
    );
  });

  it('names a single evening with its date', () => {
    expect(deriveHeroIntro([seasonEvent({})])).toBe(
      'Ein Abend im Dorfgemeindehaus Großfurra, am 23. Januar 2027.',
    );
  });

  it('drops the venue clause when the venues differ', () => {
    const events = [
      seasonEvent({}),
      seasonEvent({
        eventId: 2,
        venue: { name: 'Festplatz', street: '', zip: '', city: 'Großfurra', hint: null },
      }),
    ];

    expect(deriveHeroIntro(events)).toBe(
      'Zwei Abende, vom 23. Januar 2027 bis zum 23. Januar 2027.',
    );
  });

  it('returns null for an empty season', () => {
    expect(deriveHeroIntro([])).toBeNull();
  });
});

describe('deriveHeroStats', () => {
  it('derives the count and the cheapest known price', () => {
    expect(deriveHeroStats(threeEvenings())).toEqual([
      { value: '3', label: 'Abende' },
      { value: 'ab 10 €', label: 'pro Karte' },
    ]);
  });

  it('omits the price while none is published', () => {
    const unpublished = [seasonEvent({ priceCents: null })];

    expect(deriveHeroStats(unpublished)).toEqual([{ value: '1', label: 'Abend' }]);
  });

  it('ignores cancelled evenings entirely', () => {
    const events = [seasonEvent({ status: 'cancelled' })];

    expect(deriveHeroStats(events)).toEqual([]);
  });
});
