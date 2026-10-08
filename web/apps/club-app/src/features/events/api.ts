import { useKkNotice } from '@furria/ui';
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CALENDAR_QUERY_KEY, toEntryWriteNotice } from '@/features/calendar';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { START_QUERY_KEY } from '@/features/start';
import type { ToDoMarkSurface } from '@/features/to-dos';
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

const refreshEvents = async (queryClient: QueryClient): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: CALENDAR_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: CLUB_HUB_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: START_QUERY_KEY }),
  ]);
};

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

export const useCreateEventMutation = (): UseMutationResult<WrittenEvent, Error, EventPayload> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: (payload: EventPayload) =>
      withFreshAccessToken((accessToken) => requestEventCreation(payload, accessToken)),
    onSuccess: (written, payload) => {
      raiseNotice(
        toEntryWriteNotice(toEventCreatedMessage(payload.title), written.venueCollisions),
      );
      void refreshEvents(queryClient);
    },
  });
};

export const useUpdateEventMutation = (): UseMutationResult<
  WrittenEvent,
  Error,
  EventUpdateInput
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: ({ eventId, payload }: EventUpdateInput) =>
      withFreshAccessToken((accessToken) => requestEventUpdate(eventId, payload, accessToken)),
    onSuccess: (written, { payload }) => {
      raiseNotice(toEntryWriteNotice(toEventSavedMessage(payload.title), written.venueCollisions));
      void refreshEvents(queryClient);
    },
  });
};

export const useTicketAvailabilityMutation = (
  event: EventDetails,
): UseMutationResult<void, Error, TicketAvailabilityInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: ({ ticketAvailability }: TicketAvailabilityInput) =>
      withFreshAccessToken((accessToken) =>
        requestTicketAvailability(event.eventId, ticketAvailability, accessToken),
      ),
    onSuccess: (_saved, { ticketAvailability }) => {
      raiseNotice({
        tone: 'success',
        message: toTicketAvailabilityMessage(event.title, ticketAvailability),
      });
    },
    onSettled: () => refreshEvents(queryClient),
  });
};

export const useEventCancelledMutation = (
  event: EventDetails,
): UseMutationResult<void, Error, EventCancelledInput> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: ({ isCancelled }: EventCancelledInput) =>
      withFreshAccessToken((accessToken) =>
        requestEventCancelled(event.eventId, isCancelled, accessToken),
      ),
    onSuccess: (_saved, { isCancelled }) => {
      const message = isCancelled
        ? toEventCancelledMessage(event.title)
        : toEventRestoredMessage(event.title);

      raiseNotice({ tone: 'success', message });
      void refreshEvents(queryClient);
    },
  });
};

export const useDeleteEventMutation = (
  event: EventDetails,
): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestEventDeletion(event.eventId, accessToken)),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: toEventDeletedMessage(event.title) });
      queryClient.removeQueries({ queryKey: eventQueryKey(event.eventId), exact: true });
      void refreshEvents(queryClient);
    },
  });
};

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

const refreshTicketRequests = async (queryClient: QueryClient): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: TICKET_REQUESTS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: START_QUERY_KEY }),
  ]);
};

export const useTicketRequestHandledMutation = (
  request: TicketRequest,
): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: () =>
      withFreshAccessToken((accessToken) =>
        requestTicketRequestHandled(request.ticketRequestId, accessToken),
      ),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: toRequestHandledMessage(request) });
    },
    onError: (error) => {
      if (isNotFoundError(error)) {
        raiseNotice({ tone: 'info', message: REQUEST_ALREADY_HANDLED_MESSAGE });
      }
    },
    onSettled: () => refreshTicketRequests(queryClient),
  });
};
