import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AttendanceAnswer } from '@/features/calendar';
import { CALENDAR_QUERY_KEY, requestAttendanceResponse } from '@/features/calendar';
import { CLUB_HUB_QUERY_KEY } from '@/features/club';
import { GROUPS_QUERY_KEY } from '@/features/groups';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { requestStart } from './requests';
import type { Start } from './schemas';
import { withEntryAttendance } from './start-answer';
import { isStartOfDay } from './start-refetch';

export const START_QUERY_KEY = ['start'] as const;

const START_STALE_MS = 30_000;
const START_GC_MS = 12 * 60 * 60 * 1000;

export const startAnswerMutationKey = (
  calendarEntryId: number,
): readonly ['start-answer', number] => ['start-answer', calendarEntryId];

const ofToday = (start: Start): Start | undefined =>
  isStartOfDay(start, new Date()) ? start : undefined;

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
): UseMutationResult<void, Error, AttendanceAnswer> =>
  useApiMutation({
    key: startAnswerMutationKey(calendarEntryId),
    offline: 'fail',
    request: (answer: AttendanceAnswer, accessToken) =>
      requestAttendanceResponse(calendarEntryId, answer, accessToken),
    optimistic: [
      optimisticPatch(START_QUERY_KEY, (current: Start | undefined, answer: AttendanceAnswer) =>
        current === undefined
          ? undefined
          : withEntryAttendance(current, calendarEntryId, { viewerAnswer: answer, isOwed: false }),
      ),
    ],
    invalidates: [CALENDAR_QUERY_KEY, CLUB_HUB_QUERY_KEY, GROUPS_QUERY_KEY],
  });
