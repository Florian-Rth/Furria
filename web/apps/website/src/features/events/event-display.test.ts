import { describe, expect, it } from 'vitest';
import type { Event } from '@/lib/public-events/schemas';
import {
  buildEventHref,
  deriveProximityLabel,
  deriveScheduleRangeLabel,
  deriveTimesLabel,
  selectEventsByDate,
} from './event-display';

const eventStartingAt = (eventId: number, startsAt: string, doorsOpenAt: string | null): Event => ({
  eventId,
  title: '1. Prunksitzung',
  startsAt,
  endsAt: null,
  doorsOpenAt,
  venue: { name: 'Dorfgemeindehaus', street: '', zip: '', city: '', hint: null },
  teaser: 'Ein voller Abend.',
  ageHint: null,
  priceCents: 1400,
  presaleStartsAt: null,
  status: 'announced',
});

describe('buildEventHref', () => {
  it('addresses an event by its id and its current title', () => {
    expect(buildEventHref({ eventId: 12, title: '1. Prunksitzung' })).toBe(
      '/events/12-1-prunksitzung',
    );
  });
});

describe('selectEventsByDate', () => {
  it('orders events by start date without mutating the input', () => {
    const later = eventStartingAt(2, '2027-02-06T14:11', null);
    const earlier = eventStartingAt(1, '2027-01-23T19:11', '2027-01-23T18:11');
    const events = [later, earlier];

    expect(selectEventsByDate(events).map((event) => event.eventId)).toEqual([1, 2]);
    expect(events[0]).toBe(later);
  });
});

describe('deriveScheduleRangeLabel', () => {
  it('spans from the earliest to the latest evening', () => {
    const events = [
      eventStartingAt(2, '2027-02-07T14:11', null),
      eventStartingAt(1, '2027-01-23T19:11', '2027-01-23T18:11'),
    ];

    expect(deriveScheduleRangeLabel(events)).toBe('23. Januar – 7. Februar 2027');
  });

  it('returns null for an empty season', () => {
    expect(deriveScheduleRangeLabel([])).toBeNull();
  });
});

describe('deriveProximityLabel', () => {
  const now = new Date('2027-01-23T09:00');

  it('says Heute on the day itself', () => {
    expect(deriveProximityLabel('2027-01-23T19:11', now)).toBe('Heute');
  });

  it('says Morgen one day ahead', () => {
    expect(deriveProximityLabel('2027-01-24T19:11', now)).toBe('Morgen');
  });

  it('names the weekday inside the seven-day window', () => {
    expect(deriveProximityLabel('2027-01-28T19:11', now)).toBe('Diesen Donnerstag');
  });

  it('stays silent from seven days ahead, where the weekday repeats', () => {
    expect(deriveProximityLabel('2027-01-30T19:11', now)).toBeNull();
  });

  it('stays silent for past evenings', () => {
    expect(deriveProximityLabel('2027-01-22T19:11', now)).toBeNull();
  });
});

describe('deriveTimesLabel', () => {
  it('states Einlass and Beginn when doors are published', () => {
    const event = eventStartingAt(1, '2027-01-23T19:11', '2027-01-23T18:11');

    expect(deriveTimesLabel(event)).toBe('Einlass 18:11 · Beginn 19:11 Uhr');
  });

  it('states only Beginn while doors are unpublished', () => {
    const event = eventStartingAt(2, '2027-02-06T14:11', null);

    expect(deriveTimesLabel(event)).toBe('Beginn 14:11 Uhr');
  });
});
