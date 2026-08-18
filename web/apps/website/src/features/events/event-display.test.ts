import { describe, expect, it } from 'vitest';
import type { Event, EventFacts } from '@/lib/seed/events';
import { buildEvent } from '@/lib/seed/events';
import {
  buildEventHref,
  buildOrderConfirmationHref,
  buildOrderFlowHref,
  deriveProximityLabel,
  deriveScheduleRangeLabel,
  deriveTimesLabel,
  selectEventsByDate,
} from './event-display';

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
  freeCount: 18,
};

const SNAPSHOT_AT = new Date('2026-12-01T12:00');

const eventStartingAt = (id: string, startsAt: string, doorsOpenAt: string | null): Event =>
  buildEvent({ ...baseFacts, id, startsAt, doorsOpenAt }, SNAPSHOT_AT);

describe('buildEventHref', () => {
  it('links the event id under /events', () => {
    expect(buildEventHref('weiberfasching-2027')).toBe('/events/weiberfasching-2027');
  });
});

describe('buildOrderFlowHref', () => {
  it('links the Bestellflow under the event', () => {
    expect(buildOrderFlowHref('weiberfasching-2027')).toBe('/events/weiberfasching-2027/order');
  });
});

describe('buildOrderConfirmationHref', () => {
  it('links a Bestellung by its own code', () => {
    expect(buildOrderConfirmationHref('demo')).toBe('/orders/demo');
  });
});

describe('selectEventsByDate', () => {
  it('orders events by start date without mutating the input', () => {
    const later = eventStartingAt('later', '2027-02-06T14:11', null);
    const earlier = eventStartingAt('earlier', '2027-01-23T19:11', '2027-01-23T18:11');
    const events = [later, earlier];

    expect(selectEventsByDate(events).map((event) => event.id)).toEqual(['earlier', 'later']);
    expect(events[0]).toBe(later);
  });
});

describe('deriveScheduleRangeLabel', () => {
  it('spans from the earliest to the latest evening', () => {
    const events = [
      eventStartingAt('last', '2027-02-07T14:11', null),
      eventStartingAt('first', '2027-01-23T19:11', '2027-01-23T18:11'),
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
    const event = eventStartingAt('with-doors', '2027-01-23T19:11', '2027-01-23T18:11');

    expect(deriveTimesLabel(event)).toBe('Einlass 18:11 · Beginn 19:11 Uhr');
  });

  it('states only Beginn while doors are unpublished', () => {
    const event = eventStartingAt('without-doors', '2027-02-06T14:11', null);

    expect(deriveTimesLabel(event)).toBe('Beginn 14:11 Uhr');
  });
});
