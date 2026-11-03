import type { UseMutationResult } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import type { ActStudioResponse } from '@/features/acts/schemas';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import { queryKeys } from '@/lib/query/reads';
import { useStudioWriteFailure } from './hooks/use-studio-write-failure';
import {
  requestEveningCopyDrop,
  requestEveningDancer,
  requestEveningJoin,
  requestEveningLeave,
} from './requests';
import { throughStudioEditor } from './studio-editor-store';
import type { EveningDancer } from './studio-evening';
import { withEveningDancer, withEveningJoined } from './studio-evening';

export interface EveningMutations {
  join: UseMutationResult<void, Error, number>;
  leave: UseMutationResult<void, Error, number>;
  dancer: UseMutationResult<void, Error, EveningDancerInput>;
  dropCopy: UseMutationResult<void, Error, number>;
}

export interface EveningDancerInput extends EveningDancer {
  eventId: number;
}

const CHANGES = ['actEvening'] as const;

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
    request: (eventId: number, accessToken) =>
      throughStudioEditor({ actId, eventId }, () =>
        requestEveningLeave(actId, eventId, accessToken),
      ),
    changes: CHANGES,
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
    request: (eventId: number, accessToken) =>
      throughStudioEditor({ actId, eventId }, () =>
        requestEveningCopyDrop(actId, eventId, accessToken),
      ),
    changes: CHANGES,
    notice: failure,
    key,
  });

  return { join, leave, dancer, dropCopy };
};
