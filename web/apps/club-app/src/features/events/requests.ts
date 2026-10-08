import type { JsonBody } from '@/lib/api/api-fetch';
import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { EventPayload } from './event-form';
import type {
  EventDetails,
  EventsResponse,
  TicketAvailability,
  TicketRequestsResponse,
  WrittenEvent,
} from './schemas';
import {
  EventDetailsSchema,
  EventsResponseSchema,
  TicketRequestsResponseSchema,
  WrittenEventSchema,
} from './schemas';

const toBody = (payload: EventPayload): JsonBody => ({
  title: payload.title,
  startsAt: payload.startsAt,
  endsAt: payload.endsAt,
  doorsOpenAt: payload.doorsOpenAt,
  venueId: payload.venueId,
  teaser: payload.teaser,
  description: payload.description,
  ageHint: payload.ageHint,
  priceCents: payload.priceCents,
  presaleStartsAt: payload.presaleStartsAt,
});

export const requestEvents = (accessToken: string): Promise<EventsResponse> =>
  apiFetch('/api/events', { schema: EventsResponseSchema, accessToken });

export const requestEvent = (eventId: number, accessToken: string): Promise<EventDetails> =>
  apiFetch(`/api/events/${eventId}`, { schema: EventDetailsSchema, accessToken });

export const requestEventCreation = (
  payload: EventPayload,
  accessToken: string,
): Promise<WrittenEvent> =>
  apiFetch('/api/events', {
    method: 'POST',
    body: toBody(payload),
    schema: WrittenEventSchema,
    accessToken,
  });

export const requestEventUpdate = (
  eventId: number,
  payload: EventPayload,
  accessToken: string,
): Promise<WrittenEvent> =>
  apiFetch(`/api/events/${eventId}`, {
    method: 'PUT',
    body: toBody(payload),
    schema: WrittenEventSchema,
    accessToken,
  });

export const requestTicketAvailability = (
  eventId: number,
  ticketAvailability: TicketAvailability,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/events/${eventId}/ticket-availability`, {
    method: 'PUT',
    body: { ticketAvailability },
    schema: NoContentSchema,
    accessToken,
  });

export const requestEventCancelled = (
  eventId: number,
  isCancelled: boolean,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/events/${eventId}/cancelled`, {
    method: 'PUT',
    body: { isCancelled },
    schema: NoContentSchema,
    accessToken,
  });

export const requestEventDeletion = (eventId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/events/${eventId}`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });

export const requestTicketRequests = (accessToken: string): Promise<TicketRequestsResponse> =>
  apiFetch('/api/ticket-requests', { schema: TicketRequestsResponseSchema, accessToken });

export const requestTicketRequestHandled = (
  ticketRequestId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/ticket-requests/${ticketRequestId}`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });
