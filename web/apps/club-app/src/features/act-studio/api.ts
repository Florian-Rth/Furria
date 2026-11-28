import type { VideoAlignment } from '@furria/studio/studio-schemas';
import type { StudioSongSplit } from '@furria/studio/studio-screen';
import type { VideoSplitInput } from '@furria/studio/studio-videos';
import type { UseMutationResult } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/api-mutation';
import { useStudioWriteFailure } from './hooks/use-studio-write-failure';
import {
  requestSongAdd,
  requestSongRemoval,
  requestSongSplit,
  requestVideoAdd,
  requestVideoAlignment,
  requestVideoRemoval,
  requestVideoSplit,
} from './requests';
import type { AddedSong, AddedVideo, SplitSong, SplitVideo } from './schemas';
import { throughStudioEditor } from './studio-editor-store';

export interface SongMutations {
  add: UseMutationResult<AddedSong, Error, number>;
  remove: UseMutationResult<void, Error, number>;
  split: UseMutationResult<SplitSong, Error, StudioSongSplit>;
}

export const useSongMutations = (actId: number): SongMutations => {
  const key = ['actSongs', actId];
  const failure = useStudioWriteFailure(actId);

  const add = useApiMutation({
    request: (mediaItemId: number, accessToken) =>
      throughStudioEditor(actId, () => requestSongAdd(actId, mediaItemId, accessToken)),
    changes: ['actMusic'],
    notice: failure,
    key,
  });
  const remove = useApiMutation({
    request: (songId: number, accessToken) =>
      throughStudioEditor(actId, () => requestSongRemoval(actId, songId, accessToken)),
    changes: ['actMusic'],
    notice: failure,
    key,
  });
  const split = useApiMutation({
    request: (input: StudioSongSplit, accessToken) =>
      throughStudioEditor(actId, () => requestSongSplit(actId, input, accessToken)),
    changes: ['actMusic'],
    notice: failure,
    key,
  });

  return { add, remove, split };
};

export interface VideoMutations {
  add: UseMutationResult<AddedVideo, Error, number>;
  align: UseMutationResult<VideoAlignment, Error, number>;
  autoAlign: UseMutationResult<VideoAlignment, Error, number>;
  remove: UseMutationResult<void, Error, number>;
  split: UseMutationResult<SplitVideo, Error, VideoSplitInput>;
}

export const useVideoMutations = (actId: number): VideoMutations => {
  const key = ['actVideos', actId];
  const failure = useStudioWriteFailure(actId);

  const add = useApiMutation({
    request: (mediaItemId: number, accessToken) =>
      throughStudioEditor(actId, () => requestVideoAdd(actId, mediaItemId, accessToken)),
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
      throughStudioEditor(actId, () => requestVideoRemoval(actId, videoId, accessToken)),
    changes: ['actVideos'],
    notice: failure,
    key,
  });

  const split = useApiMutation({
    request: (input: VideoSplitInput, accessToken) =>
      throughStudioEditor(actId, () => requestVideoSplit(actId, input, accessToken)),
    changes: ['actVideos'],
    notice: failure,
    key,
  });

  return { add, align, autoAlign, remove, split };
};
