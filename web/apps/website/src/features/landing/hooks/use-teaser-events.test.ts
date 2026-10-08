import { describe, expect, it } from 'vitest';
import type { Event, SalesStatus } from '@/lib/public-events/schemas';
import { selectTeaserEvents, TEASER_EVENT_COUNT } from './use-teaser-events';

const evening = (eventId: number, startsAt: string, status: SalesStatus): Event => ({
  eventId,
  title: `Abend ${eventId}`,
  startsAt,
  endsAt: null,
  doorsOpenAt: null,
  venue: { name: 'Dorfgemeindehaus', street: '', zip: '', city: '', hint: null },
  teaser: 'Ein Abend.',
  ageHint: null,
  priceCents: null,
  presaleStartsAt: null,
  status,
});

describe('selectTeaserEvents', () => {
  it('picks the three earliest evenings in chronological order', () => {
    const events = [
      evening(4, '2027-02-06T14:11', 'announced'),
      evening(2, '2027-01-30T19:11', 'available'),
      evening(3, '2027-02-04T19:11', 'soldOut'),
      evening(1, '2027-01-23T19:11', 'fewLeft'),
    ];

    const teaser = selectTeaserEvents(events);

    expect(teaser).toHaveLength(TEASER_EVENT_COUNT);
    expect(teaser.map((event) => event.eventId)).toEqual([1, 2, 3]);
  });

  it('never teases a cancelled evening, however early it lies', () => {
    const events = [
      evening(1, '2027-01-09T19:11', 'cancelled'),
      evening(2, '2027-01-23T19:11', 'available'),
    ];

    expect(selectTeaserEvents(events).map((event) => event.eventId)).toEqual([2]);
  });

  it('leaves the given list untouched', () => {
    const events = [
      evening(2, '2027-01-30T19:11', 'available'),
      evening(1, '2027-01-23T19:11', 'available'),
    ];

    selectTeaserEvents(events);

    expect(events.map((event) => event.eventId)).toEqual([2, 1]);
  });
});
