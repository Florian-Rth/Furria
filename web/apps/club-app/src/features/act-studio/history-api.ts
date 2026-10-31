import type {
  InfiniteData,
  QueryKey,
  UseInfiniteQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { skipToken, useInfiniteQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { useStudioUndo } from './hooks/use-studio-undo';
import { useStudioWriteFailure } from './hooks/use-studio-write-failure';
import { requestChoreographyRestore, requestChoreographyVersions } from './requests';
import type { ChoreographyVersionPage, SavedChoreography } from './schemas';

type VersionCursor = number | null;

const NEWEST_PAGE: VersionCursor = null;

const olderCursorOf = (page: ChoreographyVersionPage): VersionCursor | undefined =>
  page.hasOlder ? page.versions.at(-1)?.version : undefined;

export const useChoreographyVersionsQuery = (
  actId: number,
  eventId: number | null,
  enabled: boolean,
): UseInfiniteQueryResult<InfiniteData<ChoreographyVersionPage, VersionCursor>, Error> =>
  useInfiniteQuery<
    ChoreographyVersionPage,
    Error,
    InfiniteData<ChoreographyVersionPage, VersionCursor>,
    QueryKey,
    VersionCursor
  >({
    queryKey: queryKeys.choreographyVersions(actId, eventId),
    queryFn: enabled
      ? ({ pageParam }) =>
          withFreshAccessToken((accessToken) =>
            requestChoreographyVersions(actId, eventId, pageParam, accessToken),
          )
      : skipToken,
    initialPageParam: NEWEST_PAGE,
    getNextPageParam: olderCursorOf,
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
