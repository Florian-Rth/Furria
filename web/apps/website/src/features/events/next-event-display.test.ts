import { describe, expect, it } from 'vitest';
import type { Event } from '@/lib/public-events/schemas';
import { deriveNextEventFace, selectNextEvent } from './next-event-display';

const NOW = new Date('2026-12-15T12:00');

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

describe('selectNextEvent', () => {
  it('prefers the earliest evening with tickets over an earlier sold-out one', () => {
    const events = [
      seasonEvent({ eventId: 1, startsAt: '2027-01-16T19:11', status: 'soldOut' }),
      seasonEvent({ eventId: 2, startsAt: '2027-01-30T19:11', status: 'fewLeft' }),
      seasonEvent({ eventId: 3, startsAt: '2027-02-06T19:11' }),
    ];

    expect(selectNextEvent(events, NOW)?.eventId).toBe(2);
  });

  it('falls back to the earliest upcoming evening when no evening has tickets', () => {
    const events = [
      seasonEvent({ eventId: 1, startsAt: '2027-02-06T19:11', status: 'announced' }),
      seasonEvent({ eventId: 2, startsAt: '2027-01-16T19:11', status: 'soldOut' }),
    ];

    expect(selectNextEvent(events, NOW)?.eventId).toBe(2);
  });

  it('skips an evening that has already begun', () => {
    expect(selectNextEvent([seasonEvent({})], new Date('2027-01-23T20:00'))).toBeNull();
  });

  it('never picks a cancelled evening', () => {
    expect(selectNextEvent([seasonEvent({ status: 'cancelled' })], NOW)).toBeNull();
  });
});

describe('deriveNextEventFace', () => {
  it.each<[Partial<Event>, ReturnType<typeof deriveNextEventFace>]>([
    [{ status: 'available' }, { kind: 'tickets' }],
    [
      { status: 'presaleScheduled', presaleStartsAt: '2027-01-10T10:00' },
      { kind: 'presale', presaleStartsAt: '2027-01-10T10:00' },
    ],
    [{ status: 'presaleScheduled', presaleStartsAt: null }, { kind: 'announced' }],
    [{ status: 'soldOut' }, { kind: 'unavailable' }],
  ])('shows the face for %j', (overrides, face) => {
    expect(deriveNextEventFace(seasonEvent(overrides))).toEqual(face);
  });
});
