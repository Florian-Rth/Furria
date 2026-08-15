import { describe, expect, it } from 'vitest';
import type { Event, EventFacts } from '@/lib/seed/events';
import { buildCancelledEvent, buildEvent } from '@/lib/seed/events';
import { deriveHeroIntro, deriveHeroStats, deriveSessionEyebrow } from './hero-display';

const SNAPSHOT_AT = new Date('2026-12-01T12:00');

const baseFacts: EventFacts = {
  id: 'prunksitzung-1-2027',
  title: '1. Prunksitzung',
  type: 'Prunksitzung',
  venue: 'Dorfgemeindehaus Großfurra',
  startsAt: '2027-01-23T19:11',
  doorsOpenAt: '2027-01-23T18:11',
  teaser: 'Ein voller Abend.',
  description: null,
  performers: null,
  ageHint: 'ab 12 Jahren empfohlen',
  priceCents: 1400,
  capacity: 260,
  presaleStartsAt: '2026-11-11T11:11',
  presaleEndsAt: null,
  freeCount: 74,
};

const seasonEvent = (overrides: Partial<EventFacts>): Event =>
  buildEvent({ ...baseFacts, ...overrides }, SNAPSHOT_AT);

const threeEvenings = (): Event[] => [
  seasonEvent({ id: 'first' }),
  seasonEvent({ id: 'second', startsAt: '2027-01-30T19:11', priceCents: 1000, freeCount: 155 }),
  seasonEvent({
    id: 'third',
    startsAt: '2027-02-07T14:11',
    doorsOpenAt: null,
    priceCents: null,
    capacity: null,
    freeCount: null,
    presaleStartsAt: null,
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
    const events = [seasonEvent({}), seasonEvent({ id: 'second', venue: 'Festplatz' })];

    expect(deriveHeroIntro(events)).toBe(
      'Zwei Abende, vom 23. Januar 2027 bis zum 23. Januar 2027.',
    );
  });

  it('returns null for an empty season', () => {
    expect(deriveHeroIntro([])).toBeNull();
  });
});

describe('deriveHeroStats', () => {
  it('derives count, cheapest known price and remaining tickets', () => {
    expect(deriveHeroStats(threeEvenings())).toEqual([
      { value: '3', label: 'Abende' },
      { value: 'ab 10 €', label: 'pro Karte' },
      { value: '229', label: 'Karten noch frei' },
    ]);
  });

  it('omits price and free seats while nothing is published', () => {
    const unpublished = [
      seasonEvent({ priceCents: null, capacity: null, freeCount: null, presaleStartsAt: null }),
    ];

    expect(deriveHeroStats(unpublished)).toEqual([{ value: '1', label: 'Abend' }]);
  });

  it('ignores cancelled evenings entirely', () => {
    const events = [buildCancelledEvent({ ...baseFacts, freeCount: null })];

    expect(deriveHeroStats(events)).toEqual([]);
  });
});
