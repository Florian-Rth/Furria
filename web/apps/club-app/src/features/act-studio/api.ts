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
  requestFinalTrackBeat,
  requestFinalTrackMatch,
  requestFinalTrackOffset,
  requestFinalTrackRemoval,
  requestPartAdd,
  requestPartRemoval,
  requestPartSettings,
  requestSongAdd,
  requestSongOrder,
  requestSongRemoval,
  requestSongSettings,
  requestStepMark,
  requestStepRemoval,
  requestStepStart,
  requestStepText,
  requestVideoAdd,
  requestVideoAlignment,
  requestVideoName,
  requestVideoRemoval,
  requestVideoStart,
} from './requests';
import type {
  AddedFinalTrack,
  AddedPart,
  AddedSong,
  AddedVideo,
  FinalTrackMatches,
  MarkedSteps,
  VideoAlignment,
} from './schemas';
import type { FinalBeatInput, FinalOffsetInput } from './studio-final';
import { withFinalBeat, withFinalOffset, withoutFinalTrack } from './studio-final';
import type { SongSettingsInput } from './studio-music';
import { withoutSong, withSongOrder, withSongSettings } from './studio-music';
import type { PartOpening, PartSettingsInput, StepStartInput, StepTextInput } from './studio-steps';
import {
  withoutPart,
  withoutStep,
  withPartSettings,
  withStepStart,
  withStepText,
} from './studio-steps';
import type { VideoNameInput, VideoStartInput } from './studio-videos';
import { withoutVideo, withVideoName, withVideoStart } from './studio-videos';

export interface SongMutations {
  add: UseMutationResult<AddedSong, Error, number>;
  reorder: UseMutationResult<void, Error, readonly number[]>;
  settle: UseMutationResult<void, Error, SongSettingsInput>;
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
  const reorder = useApiMutation({
    request: (songIds: readonly number[], accessToken) =>
      requestSongOrder(actId, songIds, accessToken),
    changes: ['actMusic'],
    optimistic: [optimisticPatch<ActStudioResponse, readonly number[]>(studioKey, withSongOrder)],
    ...undoable((songIds: readonly number[]) => ({ kind: 'songOrder', songIds })),
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
    ...undoable((input: SongSettingsInput) => ({ kind: 'songSettings', ...input })),
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

  return { add, reorder, settle, remove };
};

export interface StepMutations {
  mark: UseMutationResult<MarkedSteps, Error, number>;
  describe: UseMutationResult<void, Error, StepTextInput>;
  move: UseMutationResult<void, Error, StepStartInput>;
  remove: UseMutationResult<void, Error, number>;
  addPart: UseMutationResult<AddedPart, Error, PartOpening>;
  settlePart: UseMutationResult<void, Error, PartSettingsInput>;
  removePart: UseMutationResult<void, Error, number>;
}

export const useStepMutations = (actId: number): StepMutations => {
  const studioKey = queryKeys.actStudio(actId);
  const key = ['actSteps', actId];
  const failure = useStudioWriteFailure(actId);
  const { undoable } = useStudioUndo(actId);

  const mark = useApiMutation({
    request: (atSeconds: number, accessToken) => requestStepMark(actId, atSeconds, accessToken),
    changes: ['actSteps'],
    ...undoable(
      (atSeconds: number) => ({ kind: 'stepsMark', atSeconds }),
      (marked: MarkedSteps) => marked.stepIds,
    ),
    notice: failure,
    key,
  });
  const describe = useApiMutation({
    request: (input: StepTextInput, accessToken) => requestStepText(actId, input, accessToken),
    changes: ['actSteps'],
    optimistic: [optimisticPatch<ActStudioResponse, StepTextInput>(studioKey, withStepText)],
    ...undoable((input: StepTextInput) => ({ kind: 'stepText', ...input })),
    notice: failure,
    key,
  });
  const move = useApiMutation({
    request: (input: StepStartInput, accessToken) => requestStepStart(actId, input, accessToken),
    changes: ['actSteps'],
    optimistic: [optimisticPatch<ActStudioResponse, StepStartInput>(studioKey, withStepStart)],
    ...undoable((input: StepStartInput) => ({ kind: 'stepStart', ...input })),
    notice: failure,
    key,
  });
  const remove = useApiMutation({
    request: (stepId: number, accessToken) => requestStepRemoval(actId, stepId, accessToken),
    changes: ['actSteps'],
    optimistic: [optimisticPatch<ActStudioResponse, number>(studioKey, withoutStep)],
    ...undoable((stepId: number) => ({ kind: 'stepsRemove', stepIds: [stepId] })),
    notice: failure,
    key,
  });
  const addPart = useApiMutation({
    request: (opening: PartOpening, accessToken) => requestPartAdd(actId, opening, accessToken),
    changes: ['actSteps'],
    ...undoable(
      (opening: PartOpening) => ({ kind: 'partAdd', ...opening }),
      (added: AddedPart) => [added.partId],
    ),
    notice: failure,
    key,
  });
  const settlePart = useApiMutation({
    request: (input: PartSettingsInput, accessToken) =>
      requestPartSettings(actId, input, accessToken),
    changes: ['actSteps'],
    optimistic: [
      optimisticPatch<ActStudioResponse, PartSettingsInput>(studioKey, withPartSettings),
    ],
    ...undoable((input: PartSettingsInput) => ({ kind: 'partSettings', ...input })),
    notice: failure,
    key,
  });
  const removePart = useApiMutation({
    request: (partId: number, accessToken) => requestPartRemoval(actId, partId, accessToken),
    changes: ['actSteps'],
    optimistic: [optimisticPatch<ActStudioResponse, number>(studioKey, withoutPart)],
    ...undoable((partId: number) => ({ kind: 'partRemove', partId })),
    notice: failure,
    key,
  });

  return { mark, describe, move, remove, addPart, settlePart, removePart };
};

export interface VideoMutations {
  add: UseMutationResult<AddedVideo, Error, number>;
  rename: UseMutationResult<void, Error, VideoNameInput>;
  place: UseMutationResult<void, Error, VideoStartInput>;
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
  const rename = useApiMutation({
    request: (input: VideoNameInput, accessToken) => requestVideoName(actId, input, accessToken),
    changes: ['actVideos'],
    optimistic: [optimisticPatch<ActStudioResponse, VideoNameInput>(studioKey, withVideoName)],
    ...undoable((input: VideoNameInput) => ({ kind: 'videoName', ...input })),
    notice: failure,
    key,
  });
  const place = useApiMutation({
    request: (input: VideoStartInput, accessToken) => requestVideoStart(actId, input, accessToken),
    changes: ['actVideos'],
    optimistic: [optimisticPatch<ActStudioResponse, VideoStartInput>(studioKey, withVideoStart)],
    ...undoable((input: VideoStartInput) => ({ kind: 'videoStart', ...input })),
    notice: failure,
    key,
  });
  const align = useApiMutation({
    request: (videoId: number, accessToken) => requestVideoAlignment(actId, videoId, accessToken),
    changes: ['actVideos'],
    ...undoable((videoId: number) => ({ kind: 'videoAlign', videoId })),
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

  return { add, rename, place, align, autoAlign, remove };
};

export interface FinalTrackMutations {
  add: UseMutationResult<AddedFinalTrack, Error, number>;
  settle: UseMutationResult<void, Error, FinalBeatInput>;
  match: UseMutationResult<FinalTrackMatches, Error, number>;
  autoMatch: UseMutationResult<FinalTrackMatches, Error, number>;
  tune: UseMutationResult<void, Error, FinalOffsetInput>;
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
  const settle = useApiMutation({
    request: (input: FinalBeatInput, accessToken) =>
      requestFinalTrackBeat(actId, input, accessToken),
    changes: ['actMusic'],
    optimistic: [optimisticPatch<ActStudioResponse, FinalBeatInput>(studioKey, withFinalBeat)],
    ...undoable((input: FinalBeatInput) => ({ kind: 'finalBeat', ...input })),
    notice: failure,
    key,
  });
  const match = useApiMutation({
    request: (finalTrackId: number, accessToken) =>
      requestFinalTrackMatch(actId, finalTrackId, accessToken),
    changes: ['actMusic'],
    ...undoable((finalTrackId: number) => ({ kind: 'finalMatch', finalTrackId })),
    notice: failure,
    key,
  });
  const autoMatch = useApiMutation({
    request: (finalTrackId: number, accessToken) =>
      requestFinalTrackMatch(actId, finalTrackId, accessToken),
    changes: ['actMusic'],
    key,
  });
  const tune = useApiMutation({
    request: (input: FinalOffsetInput, accessToken) =>
      requestFinalTrackOffset(actId, input, accessToken),
    changes: ['actMusic'],
    optimistic: [optimisticPatch<ActStudioResponse, FinalOffsetInput>(studioKey, withFinalOffset)],
    ...undoable(
      ({ finalTrackId, sourceMediaItemId, offsetSeconds, stretch }: FinalOffsetInput) => ({
        kind: 'finalOffsets',
        finalTrackId,
        offsets: [{ sourceMediaItemId, offsetSeconds, stretch }],
      }),
    ),
    notice: failure,
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

  return { add, settle, match, autoMatch, tune, adopt, remove };
};
