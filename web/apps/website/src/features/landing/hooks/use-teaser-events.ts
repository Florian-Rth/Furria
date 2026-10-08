import { usePublicEventsQuery } from '@/lib/public-events/api';
import type { Event } from '@/lib/public-events/schemas';

export const TEASER_EVENT_COUNT = 3;

export const selectTeaserEvents = (events: Event[]): Event[] =>
  events
    .filter((event) => event.status !== 'cancelled')
    .sort((first, second) => first.startsAt.localeCompare(second.startsAt))
    .slice(0, TEASER_EVENT_COUNT);

export const useTeaserEvents = (): Event[] => {
  const { data } = usePublicEventsQuery();

  return selectTeaserEvents(data ?? []);
};
