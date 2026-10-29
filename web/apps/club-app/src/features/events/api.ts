import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery } from '@tanstack/react-query';
import { toEntryWriteNotice } from '@/features/calendar/calendar-authoring';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import type { EventPayload } from './event-form';
import {
  toEventCancelledMessage,
  toEventCreatedMessage,
  toEventDeletedMessage,
  toEventPublishedMessage,
  toEventRestoredMessage,
  toEventSavedMessage,
  toTicketAvailabilityMessage,
} from './events-labels';
import type { EventGalleryPick } from './requests';
import {
  requestEvent,
  requestEventCancelled,
  requestEventCreation,
  requestEventDeletion,
  requestEventPictureFromGallery,
  requestEventPublished,
  requestEvents,
  requestEventUpdate,
  requestTicketAvailability,
} from './requests';
import type { EventDetails, EventsResponse, TicketAvailability, WrittenEvent } from './schemas';

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

export const useCreateEventMutation = (): UseMutationResult<WrittenEvent, Error, EventPayload> =>
  useApiMutation({
    request: requestEventCreation,
    changes: ['event'],
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
    changes: ['event'],
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
    changes: ['event'],
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
    changes: ['event'],
    notice: {
      success: ({ isCancelled }) =>
        isCancelled ? toEventCancelledMessage(event.title) : toEventRestoredMessage(event.title),
    },
  });

export const useEventPublishedMutation = (): UseMutationResult<void, Error, EventDetails> =>
  useApiMutation({
    request: (event: EventDetails, accessToken) =>
      requestEventPublished(event.eventId, accessToken),
    changes: ['event'],
    notice: { success: (event) => toEventPublishedMessage(event.title) },
  });

export const useDeleteEventMutation = (event: EventDetails): UseMutationResult<void, Error, void> =>
  useApiMutation({
    request: (_input, accessToken) => requestEventDeletion(event.eventId, accessToken),
    changes: ['event'],
    forgets: [queryKeys.event(event.eventId)],
    notice: { success: () => toEventDeletedMessage(event.title) },
  });

const EVENT_PICTURE_FAILURE = { failure: toWriteErrorMessage };

export const useEventPictureFromGalleryMutation = (): UseMutationResult<
  void,
  Error,
  EventGalleryPick
> =>
  useApiMutation({
    request: requestEventPictureFromGallery,
    changes: ['event'],
    notice: EVENT_PICTURE_FAILURE,
  });
