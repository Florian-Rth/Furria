import { useKkNotice } from '@furria/ui';
import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { toWriteErrorMessage } from '@/lib/write-error';
import { toAttendanceSavedMessage } from './calendar-labels';
import type { CalendarQuery, CalendarScope } from './calendar-query';
import { requestAttendanceResponse, requestCalendar } from './requests';
import type { AttendanceAnswer, CalendarResponse } from './schemas';

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

const refreshCalendar = (queryClient: QueryClient): void => {
  void queryClient.invalidateQueries({ queryKey: CALENDAR_QUERY_KEY });
  void queryClient.invalidateQueries({ queryKey: CLUB_HUB_QUERY_KEY });
};

export const useCalendarQuery = (query: CalendarQuery): UseQueryResult<CalendarResponse, Error> =>
  useQuery({
    queryKey: calendarQueryKey(query.scope, query.groupId, query.from, query.to),
    queryFn: () => withFreshAccessToken((accessToken) => requestCalendar(query, accessToken)),
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
      refreshCalendar(queryClient);
    },
    onError: (error) => {
      const message = toWriteErrorMessage(error);

      if (message !== null) {
        raiseNotice({ tone: 'error', message });
      }
      refreshCalendar(queryClient);
    },
  });
};
