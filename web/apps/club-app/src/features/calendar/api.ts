import { useKkNotice } from '@furria/ui';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import type { CalendarEntryPayload } from './calendar-authoring';
import { toEntryWriteNotice } from './calendar-authoring';
import {
  toEntryCreatedMessage,
  toEntryDeletedMessage,
  toEntrySavedMessage,
} from './calendar-labels';
import type { CalendarQuery } from './calendar-query';
import {
  requestCalendar,
  requestCalendarEntryCreation,
  requestCalendarEntryDeletion,
  requestCalendarEntryUpdate,
  requestRunningVenues,
} from './requests';
import type { CalendarResponse, RunningVenuesResponse, WrittenCalendarEntry } from './schemas';

export const useCalendarQuery = (query: CalendarQuery): UseQueryResult<CalendarResponse, Error> =>
  useQuery({
    queryKey: queryKeys.calendar(query.scope, query.groupId, query.from, query.to),
    queryFn: () => withFreshAccessToken((accessToken) => requestCalendar(query, accessToken)),
    placeholderData: keepPreviousData,
  });

export const useRunningVenuesQuery = (): UseQueryResult<RunningVenuesResponse, Error> =>
  useQuery({
    queryKey: queryKeys.runningVenues,
    queryFn: () => withFreshAccessToken((accessToken) => requestRunningVenues(accessToken)),
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
> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['calendarEntry'] },
    mutationFn: ({ payload }: CalendarEntryInput) =>
      withFreshAccessToken((accessToken) => requestCalendarEntryCreation(payload, accessToken)),
    onSuccess: (written, { payload }) => {
      raiseNotice(
        toEntryWriteNotice(toEntryCreatedMessage(payload.title), written.venueCollisions),
      );
    },
  });
};

export const useUpdateCalendarEntryMutation = (): UseMutationResult<
  WrittenCalendarEntry,
  Error,
  CalendarEntryUpdateInput
> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['calendarEntry'] },
    mutationFn: ({ calendarEntryId, payload }: CalendarEntryUpdateInput) =>
      withFreshAccessToken((accessToken) =>
        requestCalendarEntryUpdate(calendarEntryId, payload, accessToken),
      ),
    onSuccess: (written, { payload }) => {
      raiseNotice(toEntryWriteNotice(toEntrySavedMessage(payload.title), written.venueCollisions));
    },
  });
};

export const useDeleteCalendarEntryMutation = (): UseMutationResult<
  void,
  Error,
  CalendarEntryDeletionInput
> => {
  const raiseNotice = useKkNotice();

  return useMutation({
    meta: { changes: ['calendarEntry'] },
    mutationFn: ({ calendarEntryId }: CalendarEntryDeletionInput) =>
      withFreshAccessToken((accessToken) =>
        requestCalendarEntryDeletion(calendarEntryId, accessToken),
      ),
    onSuccess: (_removed, { title }) => {
      raiseNotice({ tone: 'success', message: toEntryDeletedMessage(title) });
    },
  });
};
