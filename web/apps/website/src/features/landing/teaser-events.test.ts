import { describe, expect, it } from 'vitest';
import type { Event, SalesStatus } from '@/lib/public-events/schemas';
import { selectTeaserEvents } from './teaser-events';

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
  it('picks the three earliest evenings that are not cancelled, in chronological order', () => {
    const events = [
      evening(5, '2027-02-06T14:11', 'announced'),
      evening(3, '2027-01-30T19:11', 'available'),
      evening(1, '2027-01-09T19:11', 'cancelled'),
      evening(4, '2027-02-04T19:11', 'soldOut'),
      evening(2, '2027-01-23T19:11', 'fewLeft'),
    ];

    expect(selectTeaserEvents(events).map((event) => event.eventId)).toEqual([2, 3, 4]);
  });
});
