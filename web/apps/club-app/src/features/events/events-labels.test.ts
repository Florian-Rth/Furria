import { describe, expect, it } from 'vitest';
import { partitionEvents, toAvailabilityState, toEventId, toEventRowMeta } from './events-labels';
import type { EventDetails, EventSummary } from './schemas';

const at = (year: number, month: number, day: number, hour: number, minute = 0): string =>
  new Date(year, month - 1, day, hour, minute).toISOString();

const summary = (overrides: Partial<EventSummary>): EventSummary => ({
  eventId: 1,
  title: '1. Prunksitzung',
  startsAt: at(2027, 1, 16, 19),
  endsAt: null,
  venueName: 'Bürgerhaus',
  presaleStartsAt: null,
  status: 'announced',
  isOver: false,
  ...overrides,
});

describe('partitionEvents', () => {
  it('folds the evenings that are over and keeps the given order', () => {
    const events = [
      summary({ eventId: 1 }),
      summary({ eventId: 2, isOver: true }),
      summary({ eventId: 3 }),
      summary({ eventId: 4, isOver: true }),
    ];

    const partition = partitionEvents(events);

    expect(partition.upcoming.map((event) => event.eventId)).toEqual([1, 3]);
    expect(partition.over.map((event) => event.eventId)).toEqual([2, 4]);
    expect(partition.overLabel).toBe('Vorbei · 2');
  });
});

describe('toEventRowMeta', () => {
  it('reads an evening past midnight with its venue', () => {
    expect(toEventRowMeta(summary({ endsAt: at(2027, 1, 17, 1, 30) }))).toBe(
      '19:00 Uhr – 17.01. 01:30 Uhr · Bürgerhaus',
    );
  });
});

describe('toEventId', () => {
  it.each<[string, number | null]>([
    ['12', 12],
    ['0', null],
    ['12-prunksitzung', null],
    ['', null],
  ])('reads „%s“ as %s', (raw, expected) => {
    expect(toEventId(raw)).toBe(expected);
  });
});

describe('toAvailabilityState', () => {
  const details = (status: EventDetails['status']): EventDetails => ({
    eventId: 1,
    title: '1. Prunksitzung',
    startsAt: at(2027, 1, 16, 19),
    endsAt: null,
    doorsOpenAt: null,
    venueId: 2,
    venueName: 'Bürgerhaus',
    teaser: 'Der Abend der Session.',
    description: null,
    ageHint: null,
    priceCents: null,
    presaleStartsAt: null,
    ticketAvailability: 'available',
    cancelledAt: null,
    status,
    isOver: false,
  });

  it.each<[EventDetails['status'], string]>([
    ['announced', 'beforePresale'],
    ['presaleScheduled', 'beforePresale'],
    ['available', 'settable'],
    ['fewLeft', 'settable'],
    ['soldOut', 'settable'],
    ['cancelled', 'cancelled'],
  ])('lets a %s event %s', (status, expected) => {
    expect(toAvailabilityState(details(status))).toBe(expected);
  });
});
