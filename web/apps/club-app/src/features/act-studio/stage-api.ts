import type { UseMutationResult } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import type { ActStudioResponse, Choreography } from '@/features/acts/schemas';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import { queryKeys } from '@/lib/query/reads';
import { useStudioWriteFailure } from './hooks/use-studio-write-failure';
import {
  requestChoreographySave,
  requestSpotAdd,
  requestSpotAssignment,
  requestSpotRemoval,
} from './requests';
import type { AddedSpot, SavedChoreography } from './schemas';
import { baseVersionOf } from './studio-formation';
import type { SpotAssignment, TrackChanges } from './studio-spots';
import {
  changedTracksOf,
  withChoreographyVersion,
  withoutSpot,
  withSpotAdded,
  withSpotPerson,
  withTracks,
} from './studio-spots';

export interface StageMutations {
  save: UseMutationResult<SavedChoreography, Error, TrackChanges>;
  addSpot: UseMutationResult<AddedSpot, Error, undefined>;
  assign: UseMutationResult<void, Error, SpotAssignment>;
  removeSpot: UseMutationResult<void, Error, number>;
}

export const useStageMutations = (actId: number): StageMutations => {
  const queryClient = useQueryClient();
  const studioKey = queryKeys.actStudio(actId);
  const key = ['actStage', actId];
  const failure = useStudioWriteFailure(actId);
  const savedVersion = useRef<number | null>(null);
  const cachedChoreography = (): Choreography | null =>
    queryClient.getQueryData<ActStudioResponse>(studioKey)?.studio?.choreography ?? null;

  const save = useApiMutation({
    request: (changes: TrackChanges, accessToken) => {
      const current = cachedChoreography();

      return requestChoreographySave(
        actId,
        baseVersionOf(savedVersion.current, current?.version ?? null),
        changedTracksOf(changes),
        accessToken,
      );
    },
    changes: ['actChoreography'],
    optimistic: [optimisticPatch<ActStudioResponse, TrackChanges>(studioKey, withTracks)],
    afterSuccess: ({ version }) => {
      savedVersion.current = version;
      queryClient.setQueryData<ActStudioResponse>(studioKey, (current) =>
        withChoreographyVersion(current, version),
      );
    },
    notice: failure,
    key,
  });
  const addSpot = useApiMutation({
    request: (_input: undefined, accessToken) => requestSpotAdd(actId, accessToken),
    changes: ['actChoreography'],
    afterSuccess: (added) => {
      queryClient.setQueryData<ActStudioResponse>(studioKey, (current) =>
        withSpotAdded(current, added),
      );
    },
    notice: failure,
    key,
  });
  const assign = useApiMutation({
    request: ({ spotId, person }: SpotAssignment, accessToken) =>
      requestSpotAssignment(actId, spotId, person?.personId ?? null, accessToken),
    changes: ['actChoreography'],
    optimistic: [optimisticPatch<ActStudioResponse, SpotAssignment>(studioKey, withSpotPerson)],
    notice: failure,
    key,
  });
  const removeSpot = useApiMutation({
    request: (spotId: number, accessToken) => requestSpotRemoval(actId, spotId, accessToken),
    changes: ['actChoreography'],
    optimistic: [optimisticPatch<ActStudioResponse, number>(studioKey, withoutSpot)],
    notice: failure,
    key,
  });

  return { save, addSpot, assign, removeSpot };
};
