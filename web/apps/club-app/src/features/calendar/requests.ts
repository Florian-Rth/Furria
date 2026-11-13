import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import { toAddOnRouteRoot, toReminderPath } from './add-on-host';
import type { CalendarEntryPayload } from './calendar-authoring';
import type { CalendarQuery } from './calendar-query';
import { toCalendarPath } from './calendar-query';
import type {
  AddOnHostKind,
  CalendarEntryResponse,
  CalendarReminderTarget,
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
  hostKind: AddOnHostKind,
  pollId: number,
  optionIds: readonly number[],
  accessToken: string,
): Promise<void> =>
  apiFetch(`${toAddOnRouteRoot(hostKind)}/polls/${pollId}/votes`, {
    method: 'PUT',
    body: { optionIds: [...optionIds] },
    schema: NoContentSchema,
    accessToken,
  });

export const requestPollClosing = (
  hostKind: AddOnHostKind,
  pollId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${toAddOnRouteRoot(hostKind)}/polls/${pollId}/close`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestPollReopening = (
  hostKind: AddOnHostKind,
  pollId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${toAddOnRouteRoot(hostKind)}/polls/${pollId}/reopen`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestOwnSignUpLine = (
  hostKind: AddOnHostKind,
  signUpListId: number,
  text: string | null,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${toAddOnRouteRoot(hostKind)}/sign-up-lists/${signUpListId}/my-line`, {
    method: 'PUT',
    body: { text },
    schema: NoContentSchema,
    accessToken,
  });

export const requestOwnSignUpLineDeletion = (
  hostKind: AddOnHostKind,
  signUpListId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${toAddOnRouteRoot(hostKind)}/sign-up-lists/${signUpListId}/my-line`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });

export const requestSignUpLineRemoval = (
  hostKind: AddOnHostKind,
  lineId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${toAddOnRouteRoot(hostKind)}/sign-up-lines/${lineId}`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });

export const requestSignUpListClosing = (
  hostKind: AddOnHostKind,
  signUpListId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${toAddOnRouteRoot(hostKind)}/sign-up-lists/${signUpListId}/close`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestCalendarReminder = (
  target: CalendarReminderTarget,
  accessToken: string,
): Promise<void> =>
  apiFetch(toReminderPath(target.host), {
    method: 'POST',
    body: { kind: target.kind, addOnId: target.addOnId },
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
