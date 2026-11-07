import type { MusicSegment } from '@furria/studio/music-timeline';
import type { AudioPeaks } from '@furria/studio/studio-schemas';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { skipToken, useQueries, useQuery } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { withFreshAccessToken } from '@/lib/api/session/session-store';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import { toCoEditorGrantedMessage, toCoEditorRevokedMessage } from './acts-copy';
import {
  requestActStudio,
  requestAudioPeaks,
  requestCoEditorGrant,
  requestCoEditorRevoke,
  requestGroupActs,
  requestMyActs,
} from './requests';
import type { ActStudioResponse, GroupActsResponse, MyActsResponse } from './schemas';

export interface CoEditorInput {
  personId: number;
  name: string;
}

export interface CoEditorMutations {
  grant: UseMutationResult<void, Error, CoEditorInput>;
  revoke: UseMutationResult<void, Error, CoEditorInput>;
}

export const useActStudioQuery = (actId: number | null): UseQueryResult<ActStudioResponse, Error> =>
  useQuery({
    queryKey: queryKeys.actStudio(actId),
    queryFn:
      actId === null
        ? skipToken
        : () => withFreshAccessToken((accessToken) => requestActStudio(actId, accessToken)),
  });

export const useGroupActsQuery = (
  groupId: number | null,
): UseQueryResult<GroupActsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.groupActs(groupId ?? 0),
    queryFn:
      groupId === null
        ? skipToken
        : () => withFreshAccessToken((accessToken) => requestGroupActs(groupId, accessToken)),
  });

export const useMyActsQuery = (mayRead = true): UseQueryResult<MyActsResponse, Error> =>
  useQuery({
    queryKey: queryKeys.myActs,
    queryFn: mayRead ? () => withFreshAccessToken(requestMyActs) : skipToken,
  });

export const useCoEditorMutations = (actId: number): CoEditorMutations => {
  const grant = useApiMutation({
    request: ({ personId }: CoEditorInput, accessToken) =>
      requestCoEditorGrant(actId, personId, accessToken),
    changes: ['actCoEditor'],
    notice: {
      success: ({ name }: CoEditorInput) => toCoEditorGrantedMessage(name),
      failure: toWriteErrorMessage,
    },
  });
  const revoke = useApiMutation({
    request: ({ personId }: CoEditorInput, accessToken) =>
      requestCoEditorRevoke(actId, personId, accessToken),
    changes: ['actCoEditor'],
    notice: {
      success: ({ name }: CoEditorInput) => toCoEditorRevokedMessage(name),
      failure: toWriteErrorMessage,
    },
  });

  return { grant, revoke };
};

export const useAudioPeaks = (
  segments: readonly MusicSegment[],
): ReadonlyMap<number, AudioPeaks> => {
  const audible = segments.filter(
    (segment, index) =>
      segment.audible &&
      segments.findIndex((candidate) => candidate.mediaItemId === segment.mediaItemId) === index,
  );

  return useQueries({
    queries: audible.map((segment) => ({
      queryKey: queryKeys.audioPeaks(segment.mediaItemId),
      queryFn: () => requestAudioPeaks(segment.peaksUrl),
      staleTime: Number.POSITIVE_INFINITY,
    })),
    combine: (results) => {
      const peaksByItem = new Map<number, AudioPeaks>();
      results.forEach((result, index) => {
        const segment = audible[index];
        if (result.data !== undefined && segment !== undefined) {
          peaksByItem.set(segment.mediaItemId, result.data);
        }
      });
      return peaksByItem;
    },
  });
};

export interface SoundSource {
  mediaItemId: number;
  peaksUrl: string;
}

const NO_PEAKS: ReadonlyMap<number, AudioPeaks> = new Map();

export const useSoundPeaks = (source: SoundSource | null): ReadonlyMap<number, AudioPeaks> => {
  const query = useQuery({
    queryKey: queryKeys.audioPeaks(source?.mediaItemId ?? 0),
    queryFn: source === null ? skipToken : () => requestAudioPeaks(source.peaksUrl),
    staleTime: Number.POSITIVE_INFINITY,
  });

  return source === null || query.data === undefined
    ? NO_PEAKS
    : new Map([[source.mediaItemId, query.data]]);
};
