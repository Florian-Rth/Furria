import type { QueryClient, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { onlineManager, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AttendanceAnswer } from '@/features/calendar';
import { CALENDAR_QUERY_KEY, requestAttendanceResponse } from '@/features/calendar';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { GROUPS_QUERY_KEY } from '@/features/groups';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { requestStart } from './requests';
import type { Start, StartAttendance } from './schemas';
import {
  attendanceOf,
  LAST_PENDING_ANSWER,
  OfflineAnswerError,
  toAnswerRollbackOf,
  withEntryAttendance,
} from './start-answer';
import { isStartOfDay } from './start-refetch';

export const START_QUERY_KEY = ['start'] as const;

const START_STALE_MS = 30_000;
const START_GC_MS = 12 * 60 * 60 * 1000;

export const startAnswerMutationKey = (
  calendarEntryId: number,
): readonly ['start-answer', number] => ['start-answer', calendarEntryId];

const confirmedAnswers = new Map<number, StartAttendance | null>();

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
): UseMutationResult<void, Error, AttendanceAnswer> => {
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
    onMutate: async (answer: AttendanceAnswer): Promise<void> => {
      if (!onlineManager.isOnline()) {
        return;
      }

      await queryClient.cancelQueries({ queryKey: START_QUERY_KEY });
      const current = attendanceOf(
        queryClient.getQueryData<Start>(START_QUERY_KEY),
        calendarEntryId,
      );

      if (current !== undefined && !confirmedAnswers.has(calendarEntryId)) {
        confirmedAnswers.set(calendarEntryId, current);
      }

      settleAttendance(queryClient, calendarEntryId, { viewerAnswer: answer, isOwed: false });
    },
    onSuccess: (_data, answer) => {
      if (confirmedAnswers.has(calendarEntryId)) {
        confirmedAnswers.set(calendarEntryId, { viewerAnswer: answer, isOwed: false });
      }
    },
    onError: () => {
      const restored = toAnswerRollbackOf(
        queryClient.isMutating({ mutationKey }),
        confirmedAnswers.get(calendarEntryId),
      );

      if (restored !== undefined) {
        settleAttendance(queryClient, calendarEntryId, restored);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: CALENDAR_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: CLUB_HUB_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });

      if (queryClient.isMutating({ mutationKey }) === LAST_PENDING_ANSWER) {
        confirmedAnswers.delete(calendarEntryId);
        void queryClient.invalidateQueries({ queryKey: START_QUERY_KEY });
      }
    },
  });
};
