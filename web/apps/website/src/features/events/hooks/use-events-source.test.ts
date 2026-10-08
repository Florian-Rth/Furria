import { describe, expect, it, vi } from 'vitest';
import type { Event } from '@/lib/public-events/schemas';
import { resolveEventsSource } from './use-events-source';

const retry = vi.fn();

const events: Event[] = [
  {
    eventId: 1,
    title: '1. Prunksitzung',
    startsAt: '2027-01-23T19:11',
    endsAt: null,
    doorsOpenAt: null,
    venue: { name: 'Dorfgemeindehaus', street: '', zip: '', city: '', hint: null },
    teaser: 'Ein voller Abend.',
    ageHint: null,
    priceCents: null,
    presaleStartsAt: null,
    status: 'announced',
  },
];

describe('resolveEventsSource', () => {
  it('waits while nothing has arrived and nothing has failed', () => {
    expect(resolveEventsSource(undefined, false, retry)).toEqual({ status: 'loading' });
  });

  it('reports the failure once the request has given up', () => {
    expect(resolveEventsSource(undefined, true, retry)).toEqual({ status: 'error', retry });
  });

  it('keeps showing the events when a later refetch fails', () => {
    expect(resolveEventsSource(events, true, retry)).toEqual({ status: 'ready', events });
  });

  it('treats a season without events as ready, not as loading', () => {
    expect(resolveEventsSource([], false, retry)).toEqual({ status: 'ready', events: [] });
  });
});
