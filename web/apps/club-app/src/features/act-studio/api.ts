import type { UseMutationResult } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
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
import { throughStudioEditor } from './studio-editor-store';

export interface SongMutations {
  add: UseMutationResult<AddedSong, Error, number>;
  remove: UseMutationResult<void, Error, number>;
}

export const useSongMutations = (actId: number): SongMutations => {
  const key = ['actSongs', actId];
  const failure = useStudioWriteFailure(actId);
  const scope = { actId, eventId: null };

  const add = useApiMutation({
    request: (mediaItemId: number, accessToken) =>
      throughStudioEditor(scope, () => requestSongAdd(actId, mediaItemId, accessToken)),
    changes: ['actMusic'],
    notice: failure,
    key,
  });
  const remove = useApiMutation({
    request: (songId: number, accessToken) =>
      throughStudioEditor(scope, () => requestSongRemoval(actId, songId, accessToken)),
    changes: ['actMusic'],
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
  const key = ['actVideos', actId];
  const failure = useStudioWriteFailure(actId);
  const scope = { actId, eventId: null };

  const add = useApiMutation({
    request: (mediaItemId: number, accessToken) =>
      throughStudioEditor(scope, () => requestVideoAdd(actId, mediaItemId, accessToken)),
    changes: ['actVideos'],
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
    request: (videoId: number, accessToken) =>
      throughStudioEditor(scope, () => requestVideoRemoval(actId, videoId, accessToken)),
    changes: ['actVideos'],
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
  const key = ['actSongs', actId];
  const failure = useStudioWriteFailure(actId);
  const scope = { actId, eventId: null };

  const add = useApiMutation({
    request: (mediaItemId: number, accessToken) =>
      throughStudioEditor(scope, () => requestFinalTrackAdd(actId, mediaItemId, accessToken)),
    changes: ['actMusic'],
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
      throughStudioEditor(scope, () => requestFinalTrackAdoption(actId, finalTrackId, accessToken)),
    changes: ['actMusic'],
    notice: failure,
    key,
  });
  const remove = useApiMutation({
    request: (finalTrackId: number, accessToken) =>
      throughStudioEditor(scope, () => requestFinalTrackRemoval(actId, finalTrackId, accessToken)),
    changes: ['actMusic'],
    notice: failure,
    key,
  });

  return { add, match, autoMatch, adopt, remove };
};
