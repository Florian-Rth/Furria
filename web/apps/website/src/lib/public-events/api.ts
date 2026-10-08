import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/api-fetch';
import { ApiError } from '@/lib/api/errors';
import { queryClient } from '@/lib/query-client';
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

const NOT_FOUND_STATUS = 404;
const MAX_RETRIES = 1;

export const shouldRetryEventRead = (failureCount: number, error: Error): boolean =>
  !(error instanceof ApiError && error.status === NOT_FOUND_STATUS) && failureCount < MAX_RETRIES;

export const ensurePublicEvent = (eventId: number): Promise<EventDetail> =>
  queryClient.ensureQueryData({
    queryKey: publicEventKeys.detail(eventId),
    queryFn: (): Promise<EventDetail> => fetchPublicEvent(eventId),
    retry: shouldRetryEventRead,
  });

export const ensurePublicEvents = (): Promise<Event[]> =>
  queryClient.ensureQueryData({ queryKey: publicEventKeys.all, queryFn: fetchPublicEvents });
