import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { onlineManager, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AttendanceAnswer } from '@/features/calendar';
import { CALENDAR_QUERY_KEY, requestAttendanceResponse } from '@/features/calendar';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { GROUPS_QUERY_KEY } from '@/features/groups';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { requestStart } from './requests';
import type { Start, StartAttendance } from './schemas';
import { attendanceOf, OfflineAnswerError, withEntryAttendance } from './start-answer';
import { isStartOfDay } from './start-refetch';

export const START_QUERY_KEY = ['start'] as const;

const START_STALE_MS = 30_000;
const START_GC_MS = 12 * 60 * 60 * 1000;
const LAST_PENDING_ANSWER = 1;

export const startAnswerMutationKey = (
  calendarEntryId: number,
): readonly ['start-answer', number] => ['start-answer', calendarEntryId];

export interface StartAnswerRollback {
  previous: StartAttendance | null | undefined;
}

const ofToday = (start: Start): Start | undefined =>
  isStartOfDay(start, new Date()) ? start : undefined;

const settleAttendance = (
  queryClient: QueryClient,
  calendarEntryId: number,
  attendance: StartAttendance | null,
): void => {
  queryClient.setQueryData<Start>(START_QUERY_KEY, (current) =>
    current === undefined ? undefined : withEntryAttendance(current, calendarEntryId, attendance),
  );
};

export const useStartQuery = (): UseQueryResult<Start | undefined, Error> =>
  useQuery({
    queryKey: START_QUERY_KEY,
    queryFn: () => withFreshAccessToken(requestStart),
    select: ofToday,
    staleTime: START_STALE_MS,
    gcTime: START_GC_MS,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

export const useStartAnswerMutation = (
  calendarEntryId: number,
): UseMutationResult<void, Error, AttendanceAnswer, StartAnswerRollback> => {
  const queryClient = useQueryClient();
  const mutationKey = startAnswerMutationKey(calendarEntryId);

  return useMutation({
    mutationKey,
    scope: { id: `answer-${calendarEntryId}` },
    networkMode: 'always',
    mutationFn: (answer: AttendanceAnswer) => {
      if (!onlineManager.isOnline()) {
        return Promise.reject(new OfflineAnswerError());
      }

      return withFreshAccessToken((accessToken) =>
        requestAttendanceResponse(calendarEntryId, answer, accessToken),
      );
    },
    onMutate: async (answer: AttendanceAnswer) => {
      if (!onlineManager.isOnline()) {
        return { previous: undefined };
      }

      await queryClient.cancelQueries({ queryKey: START_QUERY_KEY });
      const previous = attendanceOf(
        queryClient.getQueryData<Start>(START_QUERY_KEY),
        calendarEntryId,
      );

      settleAttendance(queryClient, calendarEntryId, { viewerAnswer: answer, isOwed: false });

      return { previous };
    },
    onError: (_error, _answer, context) => {
      if (context?.previous === undefined) {
        return;
      }

      settleAttendance(queryClient, calendarEntryId, context.previous);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: CALENDAR_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: CLUB_HUB_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });

      if (queryClient.isMutating({ mutationKey }) === LAST_PENDING_ANSWER) {
        void queryClient.invalidateQueries({ queryKey: START_QUERY_KEY });
      }
    },
  });
};
