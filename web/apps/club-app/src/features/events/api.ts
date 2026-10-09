import { useKkNotice } from '@furria/ui';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toEntryWriteNotice } from '@/features/calendar';
import type { ToDoMarkSurface } from '@/features/to-dos';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
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

export const useEventsQuery = (): UseQueryResult<EventsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.events,
    queryFn: () => withFreshAccessToken(requestEvents),
  });

export const useEventQuery = (eventId: number | null): UseQueryResult<EventDetails, Error> => {
  const load =
    eventId === null
      ? skipToken
      : (): Promise<EventDetails> =>
          withFreshAccessToken((accessToken) => requestEvent(eventId, accessToken));

  return useQuery({ queryKey: queryKeys.event(eventId), queryFn: load });
};

export const useCreateEventMutation = (): UseMutationResult<WrittenEvent, Error, EventPayload> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['event'] },
    mutationFn: (payload: EventPayload) =>
      withFreshAccessToken((accessToken) => requestEventCreation(payload, accessToken)),
    onSuccess: (written, payload) => {
      raiseNotice(
        toEntryWriteNotice(toEventCreatedMessage(payload.title), written.venueCollisions),
      );
    },
  });
};

export const useUpdateEventMutation = (): UseMutationResult<
  WrittenEvent,
  Error,
  EventUpdateInput
> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['event'] },
    mutationFn: ({ eventId, payload }: EventUpdateInput) =>
      withFreshAccessToken((accessToken) => requestEventUpdate(eventId, payload, accessToken)),
    onSuccess: (written, { payload }) => {
      raiseNotice(toEntryWriteNotice(toEventSavedMessage(payload.title), written.venueCollisions));
    },
  });
};

export const useTicketAvailabilityMutation = (
  event: EventDetails,
): UseMutationResult<void, Error, TicketAvailabilityInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['event'], settlesWhenFresh: true },
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
  });
};

export const useEventCancelledMutation = (
  event: EventDetails,
): UseMutationResult<void, Error, EventCancelledInput> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['event'] },
    mutationFn: ({ isCancelled }: EventCancelledInput) =>
      withFreshAccessToken((accessToken) =>
        requestEventCancelled(event.eventId, isCancelled, accessToken),
      ),
    onSuccess: (_saved, { isCancelled }) => {
      const message = isCancelled
        ? toEventCancelledMessage(event.title)
        : toEventRestoredMessage(event.title);

      raiseNotice({ tone: 'success', message });
    },
  });
};

export const useDeleteEventMutation = (
  event: EventDetails,
): UseMutationResult<void, Error, void> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['event'] },
    mutationFn: () =>
      withFreshAccessToken((accessToken) => requestEventDeletion(event.eventId, accessToken)),
    onSuccess: () => {
      raiseNotice({ tone: 'success', message: toEventDeletedMessage(event.title) });
      queryClient.removeQueries({ queryKey: queryKeys.event(event.eventId), exact: true });
    },
  });
};

export const useTicketRequestsQuery = (
  isEnabled: boolean,
): UseQueryResult<TicketRequestsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.ticketRequests,
    queryFn: () => withFreshAccessToken(requestTicketRequests),
    enabled: isEnabled,
  });

export const TICKET_REQUEST_TO_DO_SURFACE: ToDoMarkSurface<TicketRequestsResponse> = {
  queryKey: queryKeys.ticketRequests,
  withMark: withTicketRequestToDoMark,
};

export const useTicketRequestHandledMutation = (
  request: TicketRequest,
): UseMutationResult<void, Error, void> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['ticketRequest'], settlesWhenFresh: true },
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
  });
};
