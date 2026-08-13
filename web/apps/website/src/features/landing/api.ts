import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { Event } from '@/lib/seed/events';
import { EventsSchema, SEEDED_EVENTS } from '@/lib/seed/events';

export const landingEventKeys = {
  all: ['landing-events'] as const,
};

const fetchLandingEvents = (): Promise<Event[]> =>
  Promise.resolve(EventsSchema.parse(SEEDED_EVENTS));

export const useLandingEventsQuery = (): UseQueryResult<Event[], Error> =>
  useQuery({ queryKey: landingEventKeys.all, queryFn: fetchLandingEvents });
