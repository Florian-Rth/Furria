import { describe, expect, it } from 'vitest';
import type { Event } from '@/lib/public-events/schemas';
import { resolveEventsSource } from './events-source';

const retry = (): void => {};

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
  it.each<[string, Event[] | undefined, boolean, string]>([
    ['nothing arrived or failed yet', undefined, false, 'loading'],
    ['the request gave up', undefined, true, 'error'],
    ['a later refetch fails', events, true, 'ready'],
    ['the season has no events', [], false, 'ready'],
  ])('when %s the source is %s', (_, source, hasFailed, status) => {
    expect(resolveEventsSource(source, hasFailed, retry).status).toBe(status);
  });
});
