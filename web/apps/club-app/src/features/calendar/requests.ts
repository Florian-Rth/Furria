import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { CalendarEntryPayload } from './calendar-authoring';
import type { CalendarQuery } from './calendar-query';
import { toCalendarPath } from './calendar-query';
import type {
  AttendanceAnswer,
  CalendarResponse,
  RunningVenuesResponse,
  WrittenCalendarEntry,
} from './schemas';
import {
  CalendarResponseSchema,
  RunningVenuesResponseSchema,
  WrittenCalendarEntrySchema,
} from './schemas';

export const requestCalendar = (
  query: CalendarQuery,
  accessToken: string,
): Promise<CalendarResponse> =>
  apiFetch(toCalendarPath(query), { schema: CalendarResponseSchema, accessToken });

export const requestRunningVenues = (accessToken: string): Promise<RunningVenuesResponse> =>
  apiFetch('/api/venues', { schema: RunningVenuesResponseSchema, accessToken });

export const requestAttendanceResponse = (
  calendarEntryId: number,
  answer: AttendanceAnswer,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/calendar/${calendarEntryId}/response`, {
    method: 'POST',
    body: { answer },
    schema: NoContentSchema,
    accessToken,
  });

export const requestCalendarEntryCreation = (
  payload: CalendarEntryPayload,
  accessToken: string,
): Promise<WrittenCalendarEntry> =>
  apiFetch('/api/calendar/entries', {
    method: 'POST',
    body: {
      title: payload.title,
      description: payload.description,
      ownerGroupId: payload.ownerGroupId,
      venueId: payload.venueId,
      startsAt: payload.startsAt,
      endsAt: payload.endsAt,
      kind: payload.kind,
      visibility: payload.visibility,
      asksForResponse: payload.asksForResponse,
    },
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
    body: {
      title: payload.title,
      description: payload.description,
      ownerGroupId: payload.ownerGroupId,
      venueId: payload.venueId,
      startsAt: payload.startsAt,
      endsAt: payload.endsAt,
      kind: payload.kind,
      visibility: payload.visibility,
      asksForResponse: payload.asksForResponse,
    },
    schema: WrittenCalendarEntrySchema,
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
