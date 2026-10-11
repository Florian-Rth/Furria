import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { GROUPS_QUERY_KEY } from '@/features/groups';
import { START_QUERY_KEY } from '@/features/start';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import type { CalendarEntryPayload } from './calendar-authoring';
import { toEntryWriteNotice } from './calendar-authoring';
import {
  toAttendanceSavedMessage,
  toEntryCreatedMessage,
  toEntryDeletedMessage,
  toEntrySavedMessage,
} from './calendar-labels';
import type { CalendarQuery, CalendarScope } from './calendar-query';
import {
  requestAttendanceResponse,
  requestCalendar,
  requestCalendarEntryCreation,
  requestCalendarEntryDeletion,
  requestCalendarEntryUpdate,
  requestRunningVenues,
} from './requests';
import type {
  AttendanceAnswer,
  CalendarResponse,
  RunningVenuesResponse,
  WrittenCalendarEntry,
} from './schemas';

export const CALENDAR_QUERY_KEY = ['calendar'] as const;

export const calendarQueryKey = (
  scope: CalendarScope,
  groupId: number | null,
  from: string | null,
  to: string | null,
): readonly [string, CalendarScope, number | null, string | null, string | null] => [
  'calendar',
  scope,
  groupId,
  from,
  to,
];

export interface AttendanceResponseInput {
  calendarEntryId: number;
  answer: AttendanceAnswer;
}

const CALENDAR_SCOPE = [
  CALENDAR_QUERY_KEY,
  CLUB_HUB_QUERY_KEY,
  GROUPS_QUERY_KEY,
  START_QUERY_KEY,
] as const;

export const useCalendarQuery = (query: CalendarQuery): UseQueryResult<CalendarResponse, Error> =>
  useQuery({
    queryKey: calendarQueryKey(query.scope, query.groupId, query.from, query.to),
    queryFn: () => withFreshAccessToken((accessToken) => requestCalendar(query, accessToken)),
    placeholderData: keepPreviousData,
  });

export const RUNNING_VENUES_QUERY_KEY = ['running-venues'] as const;

export const useRunningVenuesQuery = (): UseQueryResult<RunningVenuesResponse, Error> =>
  useQuery({
    queryKey: RUNNING_VENUES_QUERY_KEY,
    queryFn: () => withFreshAccessToken((accessToken) => requestRunningVenues(accessToken)),
  });

export const useAttendanceResponseMutation = (): UseMutationResult<
  void,
  Error,
  AttendanceResponseInput
> =>
  useApiMutation({
    request: ({ calendarEntryId, answer }: AttendanceResponseInput, accessToken) =>
      requestAttendanceResponse(calendarEntryId, answer, accessToken),
    invalidates: CALENDAR_SCOPE,
    notice: { success: ({ answer }) => toAttendanceSavedMessage(answer) },
  });

export interface CalendarEntryInput {
  payload: CalendarEntryPayload;
}

export interface CalendarEntryUpdateInput extends CalendarEntryInput {
  calendarEntryId: number;
}

export interface CalendarEntryDeletionInput {
  calendarEntryId: number;
  title: string;
}

export const useCreateCalendarEntryMutation = (): UseMutationResult<
  WrittenCalendarEntry,
  Error,
  CalendarEntryInput
> =>
  useApiMutation({
    request: ({ payload }: CalendarEntryInput, accessToken) =>
      requestCalendarEntryCreation(payload, accessToken),
    invalidates: CALENDAR_SCOPE,
    notice: {
      success: ({ payload }, written) =>
        toEntryWriteNotice(toEntryCreatedMessage(payload.title), written.venueCollisions),
    },
  });

export const useUpdateCalendarEntryMutation = (): UseMutationResult<
  WrittenCalendarEntry,
  Error,
  CalendarEntryUpdateInput
> =>
  useApiMutation({
    request: ({ calendarEntryId, payload }: CalendarEntryUpdateInput, accessToken) =>
      requestCalendarEntryUpdate(calendarEntryId, payload, accessToken),
    invalidates: CALENDAR_SCOPE,
    notice: {
      success: ({ payload }, written) =>
        toEntryWriteNotice(toEntrySavedMessage(payload.title), written.venueCollisions),
    },
  });

export const useDeleteCalendarEntryMutation = (): UseMutationResult<
  void,
  Error,
  CalendarEntryDeletionInput
> =>
  useApiMutation({
    request: ({ calendarEntryId }: CalendarEntryDeletionInput, accessToken) =>
      requestCalendarEntryDeletion(calendarEntryId, accessToken),
    invalidates: CALENDAR_SCOPE,
    notice: { success: ({ title }) => toEntryDeletedMessage(title) },
  });
