import { describe, expect, it } from 'vitest';
import type { AvailabilityState } from './events-labels';
import { partitionEvents, toAvailabilityState } from './events-labels';
import type { EventDetails, EventSummary } from './schemas';

const summary = (overrides: Partial<EventSummary>): EventSummary => ({
  eventId: 1,
  title: '1. Prunksitzung',
  startsAt: '2027-01-16T18:00:00.000Z',
  endsAt: null,
  venueName: 'Bürgerhaus',
  presaleStartsAt: null,
  status: 'announced',
  isOver: false,
  ...overrides,
});

describe('partitionEvents', () => {
  it('folds the evenings that are over and keeps the given order', () => {
    const partition = partitionEvents([
      summary({ eventId: 1 }),
      summary({ eventId: 2, isOver: true }),
      summary({ eventId: 3 }),
      summary({ eventId: 4, isOver: true }),
    ]);

    expect(partition.upcoming.map((event) => event.eventId)).toEqual([1, 3]);
    expect(partition.over.map((event) => event.eventId)).toEqual([2, 4]);
  });
});

describe('toAvailabilityState', () => {
  const details = (status: EventDetails['status']): EventDetails => ({
    eventId: 1,
    title: '1. Prunksitzung',
    startsAt: '2027-01-16T18:00:00.000Z',
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

  it.each<[EventDetails['status'], AvailabilityState]>([
    ['presaleScheduled', 'beforePresale'],
    ['soldOut', 'settable'],
    ['cancelled', 'cancelled'],
  ])('lets a %s event %s', (status, expected) => {
    expect(toAvailabilityState(details(status))).toBe(expected);
  });
});
