import { refusalMessageOf, refusalPayloadOf } from '@furria/api-client';
import type { KkNoticeRequest } from '@furria/ui/KkNotice';
import { useQueryClient } from '@tanstack/react-query';
import type { ActStudioResponse } from '@/features/acts/schemas';
import { queryKeys } from '@/lib/query/reads';
import { choreographyConflictOf, overlapRowsOf } from '../studio-conflict';
import { STUDIO_CHANGED_ELSEWHERE } from '../studio-copy';
import type { TrackChanges } from '../studio-spots';
import { MERGE_KEEP_MINE, MERGE_TAKE_THEIRS, overlapLineOf } from '../undo-copy';
import type { StudioWriteNotice } from './use-studio-write-failure';

export interface ChoreographyConflictNotice {
  failure: (error: Error, changes: TrackChanges) => string | KkNoticeRequest | null;
}

export const useChoreographyConflict = (
  actId: number,
  fallback: StudioWriteNotice,
  resave: (changes: TrackChanges) => void,
): ChoreographyConflictNotice => {
  const queryClient = useQueryClient();
  const studioKey = queryKeys.actStudio(actId);

  return {
    failure: (error, changes) => {
      const conflict = choreographyConflictOf(refusalPayloadOf(error));
      const studio = queryClient.getQueryData<ActStudioResponse>(studioKey)?.studio ?? null;
      if (conflict === null || studio === null) {
        return fallback.failure(error);
      }

      return {
        tone: 'error',
        message: refusalMessageOf(error) ?? STUDIO_CHANGED_ELSEWHERE,
        detail: overlapRowsOf(conflict, studio).map(overlapLineOf),
        actions: [
          {
            id: 'keepMine',
            label: MERGE_KEEP_MINE,
            onSelect: () => {
              void queryClient.refetchQueries({ queryKey: studioKey }, { throwOnError: true }).then(
                () => {
                  resave(changes);
                },
                () => undefined,
              );
            },
          },
          {
            id: 'takeTheirs',
            label: MERGE_TAKE_THEIRS,
            onSelect: () => {
              void queryClient.invalidateQueries({ queryKey: studioKey });
            },
          },
        ],
      };
    },
  };
};
