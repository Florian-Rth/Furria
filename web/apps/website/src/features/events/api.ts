import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { Event } from '@/lib/seed/events';
import { EventsSchema, SEEDED_EVENTS } from '@/lib/seed/events';

export const eventKeys = {
  all: ['events'] as const,
};

const fetchEvents = (): Promise<Event[]> => Promise.resolve(EventsSchema.parse(SEEDED_EVENTS));

export const useEventsQuery = (): UseQueryResult<Event[], Error> =>
  useQuery({ queryKey: eventKeys.all, queryFn: fetchEvents });
