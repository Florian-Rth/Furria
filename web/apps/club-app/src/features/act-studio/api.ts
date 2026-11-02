import type { UseMutationResult } from '@tanstack/react-query';
import type { ActStudioResponse } from '@/features/acts/schemas';
import { useApiMutation } from '@/lib/api/api-mutation';
import { optimisticPatch } from '@/lib/api/optimistic-patch';
import { queryKeys } from '@/lib/query/reads';
import { useStudioUndo } from './hooks/use-studio-undo';
import { useStudioWriteFailure } from './hooks/use-studio-write-failure';
import {
  requestFinalTrackAdd,
  requestFinalTrackAdoption,
  requestFinalTrackMatch,
  requestFinalTrackRemoval,
  requestSongAdd,
  requestSongRemoval,
  requestVideoAdd,
  requestVideoAlignment,
  requestVideoRemoval,
} from './requests';
import type {
  AddedFinalTrack,
  AddedSong,
  AddedVideo,
  FinalTrackMatches,
  VideoAlignment,
} from './schemas';
import { withoutFinalTrack } from './studio-final';
import { withoutSong } from './studio-music';
import { withoutVideo } from './studio-videos';

export interface SongMutations {
  add: UseMutationResult<AddedSong, Error, number>;
  remove: UseMutationResult<void, Error, number>;
}

export const useSongMutations = (actId: number): SongMutations => {
  const studioKey = queryKeys.actStudio(actId);
  const key = ['actSongs', actId];
  const failure = useStudioWriteFailure(actId);
  const { undoable } = useStudioUndo(actId);

  const add = useApiMutation({
    request: (mediaItemId: number, accessToken) => requestSongAdd(actId, mediaItemId, accessToken),
    changes: ['actMusic'],
    ...undoable(
      (mediaItemId: number) => ({ kind: 'songAdd', mediaItemId }),
      (added: AddedSong) => [added.songId],
    ),
    notice: failure,
    key,
  });
  const remove = useApiMutation({
    request: (songId: number, accessToken) => requestSongRemoval(actId, songId, accessToken),
    changes: ['actMusic'],
    optimistic: [optimisticPatch<ActStudioResponse, number>(studioKey, withoutSong)],
    ...undoable((songId: number) => ({ kind: 'songRemove', songId })),
    notice: failure,
    key,
  });

  return { add, remove };
};

export interface VideoMutations {
  add: UseMutationResult<AddedVideo, Error, number>;
  align: UseMutationResult<VideoAlignment, Error, number>;
  autoAlign: UseMutationResult<VideoAlignment, Error, number>;
  remove: UseMutationResult<void, Error, number>;
}

export const useVideoMutations = (actId: number): VideoMutations => {
  const studioKey = queryKeys.actStudio(actId);
  const key = ['actVideos', actId];
  const failure = useStudioWriteFailure(actId);
  const { undoable } = useStudioUndo(actId);

  const add = useApiMutation({
    request: (mediaItemId: number, accessToken) => requestVideoAdd(actId, mediaItemId, accessToken),
    changes: ['actVideos'],
    ...undoable(
      (mediaItemId: number) => ({ kind: 'videoAdd', mediaItemId }),
      (added: AddedVideo) => [added.videoId],
    ),
    notice: failure,
    key,
  });
  const align = useApiMutation({
    request: (videoId: number, accessToken) => requestVideoAlignment(actId, videoId, accessToken),
    changes: ['actVideos'],
    notice: failure,
    key,
  });
  const autoAlign = useApiMutation({
    request: (videoId: number, accessToken) => requestVideoAlignment(actId, videoId, accessToken),
    changes: ['actVideos'],
    key,
  });
  const remove = useApiMutation({
    request: (videoId: number, accessToken) => requestVideoRemoval(actId, videoId, accessToken),
    changes: ['actVideos'],
    optimistic: [optimisticPatch<ActStudioResponse, number>(studioKey, withoutVideo)],
    ...undoable((videoId: number) => ({ kind: 'videoRemove', videoId })),
    notice: failure,
    key,
  });

  return { add, align, autoAlign, remove };
};

export interface FinalTrackMutations {
  add: UseMutationResult<AddedFinalTrack, Error, number>;
  match: UseMutationResult<FinalTrackMatches, Error, number>;
  autoMatch: UseMutationResult<FinalTrackMatches, Error, number>;
  adopt: UseMutationResult<void, Error, number>;
  remove: UseMutationResult<void, Error, number>;
}

export const useFinalTrackMutations = (actId: number): FinalTrackMutations => {
  const studioKey = queryKeys.actStudio(actId);
  const key = ['actSongs', actId];
  const failure = useStudioWriteFailure(actId);
  const { undoable } = useStudioUndo(actId);

  const add = useApiMutation({
    request: (mediaItemId: number, accessToken) =>
      requestFinalTrackAdd(actId, mediaItemId, accessToken),
    changes: ['actMusic'],
    ...undoable(
      (mediaItemId: number) => ({ kind: 'finalAdd', mediaItemId }),
      (added: AddedFinalTrack) => [added.finalTrackId],
    ),
    notice: failure,
    key,
  });
  const match = useApiMutation({
    request: (finalTrackId: number, accessToken) =>
      requestFinalTrackMatch(actId, finalTrackId, accessToken),
    changes: ['actMusic'],
    notice: failure,
    key,
  });
  const autoMatch = useApiMutation({
    request: (finalTrackId: number, accessToken) =>
      requestFinalTrackMatch(actId, finalTrackId, accessToken),
    changes: ['actMusic'],
    key,
  });
  const adopt = useApiMutation({
    request: (finalTrackId: number, accessToken) =>
      requestFinalTrackAdoption(actId, finalTrackId, accessToken),
    changes: ['actMusic'],
    ...undoable((finalTrackId: number) => ({ kind: 'finalAdopt', finalTrackId })),
    notice: failure,
    key,
  });
  const remove = useApiMutation({
    request: (finalTrackId: number, accessToken) =>
      requestFinalTrackRemoval(actId, finalTrackId, accessToken),
    changes: ['actMusic'],
    optimistic: [optimisticPatch<ActStudioResponse, number>(studioKey, withoutFinalTrack)],
    ...undoable((finalTrackId: number) => ({ kind: 'finalRemove', finalTrackId })),
    notice: failure,
    key,
  });

  return { add, match, autoMatch, adopt, remove };
};
