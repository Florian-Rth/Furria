import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery } from '@tanstack/react-query';
import { CALENDAR_QUERY_KEY, toEntryWriteNotice } from '@/features/calendar';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { START_QUERY_KEY } from '@/features/start';
import type { ToDoMarkSurface } from '@/features/to-dos';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { isNotFoundError } from '@/lib/query-error';
import type { EventPayload } from './event-form';
import {
  toEventCancelledMessage,
  toEventCreatedMessage,
  toEventDeletedMessage,
  toEventRestoredMessage,
  toEventSavedMessage,
  toTicketAvailabilityMessage,
} from './events-labels';
import {
  requestEvent,
  requestEventCancelled,
  requestEventCreation,
  requestEventDeletion,
  requestEvents,
  requestEventUpdate,
  requestTicketAvailability,
  requestTicketRequestHandled,
  requestTicketRequests,
} from './requests';
import type {
  EventDetails,
  EventsResponse,
  TicketAvailability,
  TicketRequest,
  TicketRequestsResponse,
  WrittenEvent,
} from './schemas';
import {
  REQUEST_ALREADY_HANDLED_MESSAGE,
  toRequestHandledMessage,
  withTicketRequestToDoMark,
} from './ticket-requests-labels';

export const EVENTS_QUERY_KEY = ['events'] as const;

export const TICKET_REQUESTS_QUERY_KEY = ['ticket-requests'] as const;

export const eventQueryKey = (eventId: number | null): readonly [string, number | null] => [
  'events',
  eventId,
];

export interface EventUpdateInput {
  eventId: number;
  payload: EventPayload;
}

export interface TicketAvailabilityInput {
  ticketAvailability: TicketAvailability;
}

export interface EventCancelledInput {
  isCancelled: boolean;
}

const EVENTS_SCOPE = [
  EVENTS_QUERY_KEY,
  CALENDAR_QUERY_KEY,
  CLUB_HUB_QUERY_KEY,
  START_QUERY_KEY,
] as const;

export const useEventsQuery = (): UseQueryResult<EventsResponse, Error> =>
  useQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestEvents),
  });

export const useEventQuery = (eventId: number | null): UseQueryResult<EventDetails, Error> => {
  const load =
    eventId === null
      ? skipToken
      : (): Promise<EventDetails> =>
          withFreshAccessToken((accessToken) => requestEvent(eventId, accessToken));

  return useQuery({ queryKey: eventQueryKey(eventId), queryFn: load });
};

export const useCreateEventMutation = (): UseMutationResult<WrittenEvent, Error, EventPayload> =>
  useApiMutation({
    request: requestEventCreation,
    invalidates: EVENTS_SCOPE,
    notice: {
      success: (payload, written) =>
        toEntryWriteNotice(toEventCreatedMessage(payload.title), written.venueCollisions),
    },
  });

export const useUpdateEventMutation = (): UseMutationResult<
  WrittenEvent,
  Error,
  EventUpdateInput
> =>
  useApiMutation({
    request: ({ eventId, payload }: EventUpdateInput, accessToken) =>
      requestEventUpdate(eventId, payload, accessToken),
    invalidates: EVENTS_SCOPE,
    notice: {
      success: ({ payload }, written) =>
        toEntryWriteNotice(toEventSavedMessage(payload.title), written.venueCollisions),
    },
  });

export const useTicketAvailabilityMutation = (
  event: EventDetails,
): UseMutationResult<void, Error, TicketAvailabilityInput> =>
  useApiMutation({
    request: ({ ticketAvailability }: TicketAvailabilityInput, accessToken) =>
      requestTicketAvailability(event.eventId, ticketAvailability, accessToken),
    invalidates: EVENTS_SCOPE,
    notice: {
      success: ({ ticketAvailability }) =>
        toTicketAvailabilityMessage(event.title, ticketAvailability),
    },
  });

export const useEventCancelledMutation = (
  event: EventDetails,
): UseMutationResult<void, Error, EventCancelledInput> =>
  useApiMutation({
    request: ({ isCancelled }: EventCancelledInput, accessToken) =>
      requestEventCancelled(event.eventId, isCancelled, accessToken),
    invalidates: EVENTS_SCOPE,
    notice: {
      success: ({ isCancelled }) =>
        isCancelled ? toEventCancelledMessage(event.title) : toEventRestoredMessage(event.title),
    },
  });

export const useDeleteEventMutation = (event: EventDetails): UseMutationResult<void, Error, void> =>
  useApiMutation({
    request: (_input, accessToken) => requestEventDeletion(event.eventId, accessToken),
    invalidates: EVENTS_SCOPE,
    forgets: [eventQueryKey(event.eventId)],
    notice: { success: () => toEventDeletedMessage(event.title) },
  });

export const useTicketRequestsQuery = (
  isEnabled: boolean,
): UseQueryResult<TicketRequestsResponse, Error> =>
  useQuery({
    queryKey: TICKET_REQUESTS_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestTicketRequests),
    enabled: isEnabled,
  });

export const TICKET_REQUEST_TO_DO_SURFACE: ToDoMarkSurface<TicketRequestsResponse> = {
  queryKey: TICKET_REQUESTS_QUERY_KEY,
  withMark: withTicketRequestToDoMark,
  alsoRefresh: [START_QUERY_KEY],
};

export const useTicketRequestHandledMutation = (
  request: TicketRequest,
): UseMutationResult<void, Error, void> =>
  useApiMutation({
    request: (_input, accessToken) =>
      requestTicketRequestHandled(request.ticketRequestId, accessToken),
    invalidates: [TICKET_REQUESTS_QUERY_KEY, START_QUERY_KEY],
    notice: {
      success: () => toRequestHandledMessage(request),
      failure: (error) =>
        isNotFoundError(error) ? { tone: 'info', message: REQUEST_ALREADY_HANDLED_MESSAGE } : null,
    },
  });
