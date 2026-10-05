import { useKkNotice } from '@furria/ui';
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { GROUPS_QUERY_KEY } from '@/features/groups';
import { START_QUERY_KEY } from '@/features/start';
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

const refreshCalendar = async (queryClient: QueryClient): Promise<void> => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: CALENDAR_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: CLUB_HUB_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY }),
    queryClient.invalidateQueries({ queryKey: START_QUERY_KEY }),
  ]);
};

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
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: ({ calendarEntryId, answer }: AttendanceResponseInput) =>
      withFreshAccessToken((accessToken) =>
        requestAttendanceResponse(calendarEntryId, answer, accessToken),
      ),
    onSuccess: (_saved, { answer }) => {
      raiseNotice({ tone: 'success', message: toAttendanceSavedMessage(answer) });
    },
    onSettled: () => refreshCalendar(queryClient),
  });
};

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
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: ({ payload }: CalendarEntryInput) =>
      withFreshAccessToken((accessToken) => requestCalendarEntryCreation(payload, accessToken)),
    onSuccess: (written, { payload }) => {
      raiseNotice(
        toEntryWriteNotice(toEntryCreatedMessage(payload.title), written.venueCollisions),
      );
      void refreshCalendar(queryClient);
    },
  });
};

export const useUpdateCalendarEntryMutation = (): UseMutationResult<
  WrittenCalendarEntry,
  Error,
  CalendarEntryUpdateInput
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: ({ calendarEntryId, payload }: CalendarEntryUpdateInput) =>
      withFreshAccessToken((accessToken) =>
        requestCalendarEntryUpdate(calendarEntryId, payload, accessToken),
      ),
    onSuccess: (written, { payload }) => {
      raiseNotice(toEntryWriteNotice(toEntrySavedMessage(payload.title), written.venueCollisions));
      void refreshCalendar(queryClient);
    },
  });
};

export const useDeleteCalendarEntryMutation = (): UseMutationResult<
  void,
  Error,
  CalendarEntryDeletionInput
> => {
  const queryClient = useQueryClient();
  const raiseNotice = useKkNotice();

  return useMutation({
    mutationFn: ({ calendarEntryId }: CalendarEntryDeletionInput) =>
      withFreshAccessToken((accessToken) =>
        requestCalendarEntryDeletion(calendarEntryId, accessToken),
      ),
    onSuccess: (_removed, { title }) => {
      raiseNotice({ tone: 'success', message: toEntryDeletedMessage(title) });
      void refreshCalendar(queryClient);
    },
  });
};
