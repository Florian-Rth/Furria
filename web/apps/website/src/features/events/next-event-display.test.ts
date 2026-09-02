import { describe, expect, it } from 'vitest';
import type { Event, EventFacts } from '@/lib/seed/events';
import { buildCancelledEvent, buildEvent } from '@/lib/seed/events';
import { deriveNextEventFace, selectNextEvent } from './next-event-display';

const SNAPSHOT_AT = new Date('2026-12-01T12:00');
const NOW = new Date('2026-12-15T12:00');

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

describe('selectNextEvent', () => {
  it('prefers the earliest evening with tickets over an earlier sold-out one', () => {
    const events = [
      seasonEvent({ id: 'sold-out', startsAt: '2027-01-16T19:11', freeCount: 0 }),
      seasonEvent({ id: 'with-tickets', startsAt: '2027-01-30T19:11' }),
      seasonEvent({ id: 'later-tickets', startsAt: '2027-02-06T19:11' }),
    ];

    expect(selectNextEvent(events, NOW)?.id).toBe('with-tickets');
  });

  it('falls back to the earliest upcoming evening when nothing is on sale', () => {
    const events = [
      seasonEvent({ id: 'sold-out', startsAt: '2027-01-16T19:11', freeCount: 0 }),
      seasonEvent({
        id: 'announced',
        startsAt: '2027-02-06T19:11',
        presaleStartsAt: null,
        priceCents: null,
        capacity: null,
        freeCount: null,
      }),
    ];

    expect(selectNextEvent(events, NOW)?.id).toBe('sold-out');
  });

  it('skips evenings that already happened', () => {
    const events = [seasonEvent({ id: 'past' })];

    expect(selectNextEvent(events, new Date('2027-03-01T12:00'))).toBeNull();
  });

  it('never picks a cancelled evening', () => {
    const events = [buildCancelledEvent(baseFacts)];

    expect(selectNextEvent(events, NOW)).toBeNull();
  });
});

describe('deriveNextEventFace', () => {
  it('shows the tickets face while seats are on sale', () => {
    expect(deriveNextEventFace(seasonEvent({}))).toEqual({ kind: 'tickets' });
    expect(deriveNextEventFace(seasonEvent({ freeCount: 18 }))).toEqual({ kind: 'tickets' });
  });

  it('counts down to a scheduled presale', () => {
    const event = seasonEvent({ presaleStartsAt: '2027-01-10T10:00', freeCount: null });

    expect(deriveNextEventFace(event)).toEqual({
      kind: 'presale',
      presaleStartsAt: '2027-01-10T10:00',
    });
  });

  it('stays announced while no presale date exists', () => {
    const event = seasonEvent({
      presaleStartsAt: null,
      priceCents: null,
      capacity: null,
      freeCount: null,
    });

    expect(deriveNextEventFace(event)).toEqual({ kind: 'announced' });
  });

  it('shows the honest unavailable face for sold-out and closed evenings', () => {
    expect(deriveNextEventFace(seasonEvent({ freeCount: 0 }))).toEqual({ kind: 'unavailable' });
    expect(deriveNextEventFace(seasonEvent({ presaleEndsAt: '2026-11-30T18:00' }))).toEqual({
      kind: 'unavailable',
    });
  });
});
