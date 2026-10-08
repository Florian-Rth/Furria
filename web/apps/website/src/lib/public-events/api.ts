import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/api-fetch';
import { queryClient } from '@/lib/query-client';
import { shouldRetryEventRead } from './event-read-retry';
import type { Event, EventDetail } from './schemas';
import { EventDetailSchema, EventsResponseSchema } from './schemas';

export const publicEventKeys = {
  all: ['public-events'] as const,
  detail: (eventId: number): readonly ['public-events', number] =>
    ['public-events', eventId] as const,
};

const fetchPublicEvents = async (): Promise<Event[]> => {
  const response = await apiFetch('/api/public/events', { schema: EventsResponseSchema });

  return response.events;
};

const fetchPublicEvent = (eventId: number): Promise<EventDetail> =>
  apiFetch(`/api/public/events/${eventId}`, { schema: EventDetailSchema });

export const usePublicEventsQuery = (): UseQueryResult<Event[], Error> =>
  useQuery({ queryKey: publicEventKeys.all, queryFn: fetchPublicEvents });

export const ensurePublicEvent = (eventId: number): Promise<EventDetail> =>
  queryClient.ensureQueryData({
    queryKey: publicEventKeys.detail(eventId),
    queryFn: (): Promise<EventDetail> => fetchPublicEvent(eventId),
    retry: shouldRetryEventRead,
  });

export const ensurePublicEvents = (): Promise<Event[]> =>
  queryClient.ensureQueryData({ queryKey: publicEventKeys.all, queryFn: fetchPublicEvents });
