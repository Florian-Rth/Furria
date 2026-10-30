import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import { LIVE_FOLLOW_INTERVAL_MS } from './live-flow';
import { requestEveningLive, requestLiveMove } from './requests';
import type { EveningLiveResponse, LiveDirection, LiveMoveBody } from './schemas';

export const useEveningLiveQuery = (
  calendarEntryId: number,
): UseQueryResult<EveningLiveResponse, Error> =>
  useQuery({
    queryKey: queryKeys.eveningLive(calendarEntryId),
    queryFn: () =>
      withFreshAccessToken((accessToken) => requestEveningLive(calendarEntryId, accessToken)),
    refetchInterval: LIVE_FOLLOW_INTERVAL_MS,
  });

export const useLiveMoveMutation = (
  calendarEntryId: number,
): UseMutationResult<LiveDirection, Error, LiveMoveBody> =>
  useApiMutation({
    request: (body: LiveMoveBody, accessToken) =>
      requestLiveMove(calendarEntryId, body, accessToken),
    changes: ['liveDirection'],
    notice: { failure: toWriteErrorMessage },
  });
