import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { CalendarEntryPayload } from './calendar-authoring';
import type { CalendarQuery } from './calendar-query';
import { toCalendarPath } from './calendar-query';
import type {
  CalendarEntryResponse,
  CalendarResponse,
  ChoosablePeopleResponse,
  RunningVenuesResponse,
  WrittenCalendarEntry,
} from './schemas';
import {
  CalendarEntryResponseSchema,
  CalendarResponseSchema,
  ChoosablePeopleResponseSchema,
  RunningVenuesResponseSchema,
  WrittenCalendarEntrySchema,
} from './schemas';

const toEntryBody = (payload: CalendarEntryPayload): CalendarEntryPayload => ({
  title: payload.title,
  description: payload.description,
  ownerGroupId: payload.ownerGroupId,
  venueId: payload.venueId,
  startsAt: payload.startsAt,
  endsAt: payload.endsAt,
  kind: payload.kind,
  audience: payload.audience,
  audienceGroupIds: payload.audienceGroupIds,
  audiencePersonIds: payload.audiencePersonIds,
  addOns: payload.addOns,
  participatingGroupIds: payload.participatingGroupIds,
});

export const requestCalendar = (
  query: CalendarQuery,
  accessToken: string,
): Promise<CalendarResponse> =>
  apiFetch(toCalendarPath(query), { schema: CalendarResponseSchema, accessToken });

export const requestCalendarEntry = (
  calendarEntryId: number,
  accessToken: string,
): Promise<CalendarEntryResponse> =>
  apiFetch(`/api/calendar/entries/${calendarEntryId}`, {
    schema: CalendarEntryResponseSchema,
    accessToken,
  });

export const requestRunningVenues = (accessToken: string): Promise<RunningVenuesResponse> =>
  apiFetch('/api/venues', { schema: RunningVenuesResponseSchema, accessToken });

export const requestChoosablePeople = (accessToken: string): Promise<ChoosablePeopleResponse> =>
  apiFetch('/api/calendar/choosable-people', {
    schema: ChoosablePeopleResponseSchema,
    accessToken,
  });

export const requestCalendarEntryCreation = (
  payload: CalendarEntryPayload,
  accessToken: string,
): Promise<WrittenCalendarEntry> =>
  apiFetch('/api/calendar/entries', {
    method: 'POST',
    body: toEntryBody(payload),
    schema: WrittenCalendarEntrySchema,
    accessToken,
  });

export const requestCalendarEntryUpdate = (
  calendarEntryId: number,
  payload: CalendarEntryPayload,
  accessToken: string,
): Promise<WrittenCalendarEntry> =>
  apiFetch(`/api/calendar/entries/${calendarEntryId}`, {
    method: 'PUT',
    body: toEntryBody(payload),
    schema: WrittenCalendarEntrySchema,
    accessToken,
  });

export const requestPollVotes = (
  pollId: number,
  optionIds: readonly number[],
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/calendar/polls/${pollId}/votes`, {
    method: 'PUT',
    body: { optionIds: [...optionIds] },
    schema: NoContentSchema,
    accessToken,
  });

export const requestPollClosing = (pollId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/calendar/polls/${pollId}/close`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestCalendarEntryDeletion = (
  calendarEntryId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/calendar/entries/${calendarEntryId}`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });
