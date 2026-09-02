import type { Event } from '@/lib/seed/events';
import { useLandingEventsQuery } from '../api';

export const TEASER_EVENT_COUNT = 3;

export const selectTeaserEvents = (events: Event[]): Event[] =>
  events
    .filter((event) => event.salesStatus !== 'cancelled')
    .sort((first, second) => first.startsAt.localeCompare(second.startsAt))
    .slice(0, TEASER_EVENT_COUNT);

export const useTeaserEvents = (): Event[] => {
  const { data } = useLandingEventsQuery();

  return selectTeaserEvents(data ?? []);
};
