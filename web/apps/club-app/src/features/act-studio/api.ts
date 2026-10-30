import type { UseMutationResult } from '@tanstack/react-query';
import type { ActStudioResponse } from '@/features/acts/schemas';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import { queryKeys } from '@/lib/query/reads';
import { toWriteErrorMessage } from '@/lib/write-error';
import {
  requestSongAdd,
  requestSongOrder,
  requestSongRemoval,
  requestSongSettings,
} from './requests';
import type { AddedSong } from './schemas';
import type { SongSettingsInput } from './studio-music';
import { withoutSong, withSongOrder, withSongSettings } from './studio-music';

export interface SongMutations {
  add: UseMutationResult<AddedSong, Error, number>;
  reorder: UseMutationResult<void, Error, readonly number[]>;
  settle: UseMutationResult<void, Error, SongSettingsInput>;
  remove: UseMutationResult<void, Error, number>;
}

export const useSongMutations = (actId: number): SongMutations => {
  const studioKey = queryKeys.actStudio(actId);
  const key = ['actSongs', actId];
  const failure = { failure: toWriteErrorMessage };

  const add = useApiMutation({
    request: (mediaItemId: number, accessToken) => requestSongAdd(actId, mediaItemId, accessToken),
    changes: ['actMusic'],
    notice: failure,
    key,
  });
  const reorder = useApiMutation({
    request: (songIds: readonly number[], accessToken) =>
      requestSongOrder(actId, songIds, accessToken),
    changes: ['actMusic'],
    optimistic: [optimisticPatch<ActStudioResponse, readonly number[]>(studioKey, withSongOrder)],
    notice: failure,
    key,
  });
  const settle = useApiMutation({
    request: ({ songId, settings }: SongSettingsInput, accessToken) =>
      requestSongSettings(actId, songId, settings, accessToken),
    changes: ['actMusic'],
    optimistic: [
      optimisticPatch<ActStudioResponse, SongSettingsInput>(studioKey, withSongSettings),
    ],
    notice: failure,
    key,
  });
  const remove = useApiMutation({
    request: (songId: number, accessToken) => requestSongRemoval(actId, songId, accessToken),
    changes: ['actMusic'],
    optimistic: [optimisticPatch<ActStudioResponse, number>(studioKey, withoutSong)],
    notice: failure,
    key,
  });

  return { add, reorder, settle, remove };
};
