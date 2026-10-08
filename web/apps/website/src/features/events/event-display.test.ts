import { describe, expect, it } from 'vitest';
import type { Event } from '@/lib/public-events/schemas';
import type { EventProximity } from './event-display';
import { deriveScheduleRangeLabel, eventProximityOf, selectEventsByDate } from './event-display';

const eventStartingAt = (eventId: number, startsAt: string): Event => ({
  eventId,
  title: '1. Prunksitzung',
  startsAt,
  endsAt: null,
  doorsOpenAt: null,
  venue: { name: 'Dorfgemeindehaus', street: '', zip: '', city: '', hint: null },
  teaser: 'Ein voller Abend.',
  ageHint: null,
  priceCents: 1400,
  presaleStartsAt: null,
  status: 'announced',
});

describe('selectEventsByDate', () => {
  it('orders a copy of the events by start date', () => {
    const events = [eventStartingAt(2, '2027-02-06T14:11'), eventStartingAt(1, '2027-01-23T19:11')];

    expect(selectEventsByDate(events).map((event) => event.eventId)).toEqual([1, 2]);
    expect(events.map((event) => event.eventId)).toEqual([2, 1]);
  });
});

describe('deriveScheduleRangeLabel', () => {
  it('spans from the earliest to the latest evening', () => {
    const events = [eventStartingAt(2, '2027-02-07T14:11'), eventStartingAt(1, '2027-01-23T19:11')];

    expect(deriveScheduleRangeLabel(events)).toBe('23. Januar – 7. Februar 2027');
  });

  it('has no range for an empty season', () => {
    expect(deriveScheduleRangeLabel([])).toBeNull();
  });
});

describe('eventProximityOf', () => {
  const now = new Date('2027-01-23T09:00');

  it.each<[string, EventProximity | null]>([
    ['2027-01-23T19:11', 'today'],
    ['2027-01-24T19:11', 'tomorrow'],
    ['2027-01-28T19:11', 'thisWeek'],
    ['2027-01-30T19:11', null],
    ['2027-01-22T19:11', null],
  ])('places an evening starting %s as %s', (startsAt, proximity) => {
    expect(eventProximityOf(startsAt, now)).toBe(proximity);
  });
});
