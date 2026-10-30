import type { UseMutationResult } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import type { ActStudioResponse, EveningChoreography } from '@/features/acts/schemas';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import { queryKeys } from '@/lib/query/reads';
import { useStudioWriteFailure } from './hooks/use-studio-write-failure';
import {
  requestEveningChoreographySave,
  requestEveningCopyDrop,
  requestEveningDancer,
  requestEveningJoin,
  requestEveningLeave,
  requestEveningSpot,
} from './requests';
import type { StageMutations } from './stage-api';
import type { EveningDancer } from './studio-evening';
import {
  withEveningCopyVersion,
  withEveningDancer,
  withEveningJoined,
  withEveningLeft,
  withEveningStudio,
  withoutEveningCopy,
} from './studio-evening';
import { baseVersionOf } from './studio-formation';
import type { SpotAssignment, TrackChanges } from './studio-spots';
import { changedTracksOf, withSpotPerson, withTracks } from './studio-spots';

export interface EveningMutations {
  join: UseMutationResult<void, Error, number>;
  leave: UseMutationResult<void, Error, number>;
  dancer: UseMutationResult<void, Error, EveningDancerInput>;
  dropCopy: UseMutationResult<void, Error, number>;
}

export interface EveningDancerInput extends EveningDancer {
  eventId: number;
}

const NO_EVENING = 0;
const CHANGES = ['actEvening'] as const;

export const useEveningStageMutations = (
  actId: number,
  eventId: number | null,
  session: StageMutations,
): StageMutations => {
  const queryClient = useQueryClient();
  const studioKey = queryKeys.actStudio(actId);
  const evening = eventId ?? NO_EVENING;
  const key = ['actEvening', actId, evening];
  const failure = useStudioWriteFailure(actId);
  const savedVersion = useRef<number | null>(null);
  const cachedCopy = (): EveningChoreography | null =>
    queryClient
      .getQueryData<ActStudioResponse>(studioKey)
      ?.studio?.evenings.find((candidate) => candidate.eventId === evening)?.appearance
      ?.choreography ?? null;

  const save = useApiMutation({
    request: (changes: TrackChanges, accessToken) => {
      const copy = cachedCopy();

      return requestEveningChoreographySave(
        actId,
        evening,
        {
          baseVersion: baseVersionOf(savedVersion.current, copy?.version ?? null),
          sessionVersion: copy?.copiedFromVersion ?? null,
          tracks: changedTracksOf(changes),
        },
        accessToken,
      );
    },
    changes: CHANGES,
    optimistic: [
      optimisticPatch<ActStudioResponse, TrackChanges>(studioKey, (current, changes) =>
        withEveningStudio(
          current,
          evening,
          (studio) => withTracks({ studio }, changes)?.studio ?? studio,
        ),
      ),
    ],
    afterSuccess: ({ version }) => {
      savedVersion.current = version;
      queryClient.setQueryData<ActStudioResponse>(studioKey, (current) =>
        withEveningCopyVersion(current, evening, version),
      );
    },
    notice: failure,
    key,
  });
  const assign = useApiMutation({
    request: ({ spotId, person }: SpotAssignment, accessToken) =>
      requestEveningSpot(actId, evening, spotId, person?.personId ?? null, accessToken),
    changes: CHANGES,
    optimistic: [
      optimisticPatch<ActStudioResponse, SpotAssignment>(studioKey, (current, assignment) =>
        withEveningStudio(
          current,
          evening,
          (studio) => withSpotPerson({ studio }, assignment)?.studio ?? studio,
        ),
      ),
    ],
    notice: failure,
    key,
  });

  return eventId === null ? session : { ...session, save, assign };
};

export const useEveningMutations = (actId: number): EveningMutations => {
  const queryClient = useQueryClient();
  const studioKey = queryKeys.actStudio(actId);
  const sessionCast = (): readonly { personId: number }[] =>
    queryClient.getQueryData<ActStudioResponse>(studioKey)?.act.cast ?? [];
  const failure = useStudioWriteFailure(actId);
  const key = ['actEvening', actId];

  const join = useApiMutation({
    request: (eventId: number, accessToken) => requestEveningJoin(actId, eventId, accessToken),
    changes: CHANGES,
    optimistic: [optimisticPatch<ActStudioResponse, number>(studioKey, withEveningJoined)],
    notice: failure,
    key,
  });
  const leave = useApiMutation({
    request: (eventId: number, accessToken) => requestEveningLeave(actId, eventId, accessToken),
    changes: CHANGES,
    optimistic: [optimisticPatch<ActStudioResponse, number>(studioKey, withEveningLeft)],
    notice: failure,
    key,
  });
  const dancer = useApiMutation({
    request: ({ eventId, person, dances }: EveningDancerInput, accessToken) =>
      requestEveningDancer(actId, eventId, person.personId, dances, accessToken),
    changes: CHANGES,
    optimistic: [
      optimisticPatch<ActStudioResponse, EveningDancerInput>(studioKey, (current, input) =>
        withEveningDancer(current, input.eventId, sessionCast(), input),
      ),
    ],
    notice: failure,
    key,
  });
  const dropCopy = useApiMutation({
    request: (eventId: number, accessToken) => requestEveningCopyDrop(actId, eventId, accessToken),
    changes: CHANGES,
    optimistic: [optimisticPatch<ActStudioResponse, number>(studioKey, withoutEveningCopy)],
    notice: failure,
    key,
  });

  return { join, leave, dancer, dropCopy };
};
