import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { useStudioUndo } from './hooks/use-studio-undo';
import { useStudioWriteFailure } from './hooks/use-studio-write-failure';
import { requestChoreographyRestore, requestChoreographyVersions } from './requests';
import type { ChoreographyVersions, SavedChoreography } from './schemas';

export const useChoreographyVersionsQuery = (
  actId: number,
  eventId: number | null,
  enabled: boolean,
): UseQueryResult<ChoreographyVersions, Error> =>
  useQuery({
    queryKey: queryKeys.choreographyVersions(actId, eventId),
    queryFn: enabled
      ? () =>
          withFreshAccessToken((accessToken) =>
            requestChoreographyVersions(actId, eventId, accessToken),
          )
      : skipToken,
  });

export const useChoreographyRestore = (
  actId: number,
  eventId: number | null,
): UseMutationResult<SavedChoreography, Error, number> => {
  const failure = useStudioWriteFailure(actId);
  const { remember, record } = useStudioUndo(actId);

  return useApiMutation({
    request: (version: number, accessToken) =>
      requestChoreographyRestore(actId, eventId, version, accessToken),
    changes: eventId === null ? ['actChoreography'] : ['actEvening'],
    remember,
    afterSuccess: (_saved, version, before) => {
      record(before, { kind: 'restore', eventId, version }, [], eventId);
    },
    notice: failure,
    key: eventId === null ? ['actStage', actId] : ['actEvening', actId, eventId],
  });
};
