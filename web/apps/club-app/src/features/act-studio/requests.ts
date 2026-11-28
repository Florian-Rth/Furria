import type { SongSettings } from '@furria/studio/studio-document';
import type { Choreography, VideoAlignment } from '@furria/studio/studio-schemas';
import { VideoAlignmentSchema } from '@furria/studio/studio-schemas';
import type { StudioSongSplit } from '@furria/studio/studio-screen';
import type {
  PartOpening,
  PartSettingsInput,
  StepBorderInput,
  StepNameInput,
  StepSpanInput,
} from '@furria/studio/studio-steps';
import type {
  VideoClipInput,
  VideoNameInput,
  VideoSplitInput,
  VideoStartInput,
} from '@furria/studio/studio-videos';
import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type {
  AddedPart,
  AddedSong,
  AddedSpot,
  AddedStep,
  AddedVideo,
  ChoreographyVersionPage,
  SavedChoreography,
  SplitSong,
  SplitVideo,
} from './schemas';
import {
  AddedPartSchema,
  AddedSongSchema,
  AddedSpotSchema,
  AddedStepSchema,
  AddedVideoSchema,
  ChoreographyVersionPageSchema,
  SavedChoreographySchema,
  SplitSongSchema,
  SplitVideoSchema,
} from './schemas';

const songsPathOf = (actId: number): string => `/api/acts/${actId}/songs`;
const stepsPathOf = (actId: number): string => `/api/acts/${actId}/steps`;
const partsPathOf = (actId: number): string => `/api/acts/${actId}/parts`;
const videosPathOf = (actId: number): string => `/api/acts/${actId}/videos`;

export const requestSongAdd = (
  actId: number,
  mediaItemId: number,
  accessToken: string,
): Promise<AddedSong> =>
  apiFetch(songsPathOf(actId), {
    method: 'POST',
    body: { mediaItemId },
    schema: AddedSongSchema,
    accessToken,
  });

export const requestSongOrder = (
  actId: number,
  songIds: readonly number[],
  accessToken: string,
): Promise<void> =>
  apiFetch(`${songsPathOf(actId)}/order`, {
    method: 'PUT',
    body: { songIds: [...songIds] },
    schema: NoContentSchema,
    accessToken,
  });

export const requestSongSettings = (
  actId: number,
  songId: number,
  settings: SongSettings,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${songsPathOf(actId)}/${songId}`, {
    method: 'PUT',
    body: {
      startSeconds: settings.startSeconds,
      endSeconds: settings.endSeconds,
      firstBeatSeconds: settings.firstBeatSeconds,
      tempoBpm: settings.tempoBpm,
    },
    schema: NoContentSchema,
    accessToken,
  });

export const requestSongSplit = (
  actId: number,
  { songId, atSeconds }: StudioSongSplit,
  accessToken: string,
): Promise<SplitSong> =>
  apiFetch(`${songsPathOf(actId)}/${songId}/split`, {
    method: 'POST',
    body: { atSeconds },
    schema: SplitSongSchema,
    accessToken,
  });

const spotsPathOf = (actId: number): string => `/api/acts/${actId}/spots`;

export const requestSpotAdd = (actId: number, accessToken: string): Promise<AddedSpot> =>
  apiFetch(spotsPathOf(actId), {
    method: 'POST',
    body: {},
    schema: AddedSpotSchema,
    accessToken,
  });

export const requestSpotAssignment = (
  actId: number,
  spotId: number,
  personId: number | null,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${spotsPathOf(actId)}/${spotId}`, {
    method: 'PUT',
    body: { personId },
    schema: NoContentSchema,
    accessToken,
  });

export const requestSpotRemoval = (
  actId: number,
  spotId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${spotsPathOf(actId)}/${spotId}`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });

export const requestChoreographySave = (
  actId: number,
  baseVersion: number | null,
  tracks: Choreography['tracks'],
  accessToken: string,
): Promise<SavedChoreography> =>
  apiFetch(`/api/acts/${actId}/choreography`, {
    method: 'PUT',
    body: { baseVersion, tracks },
    schema: SavedChoreographySchema,
    accessToken,
  });

export const requestSongRemoval = (
  actId: number,
  songId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${songsPathOf(actId)}/${songId}`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });

export const requestStepAdd = (
  actId: number,
  { startSeconds, endSeconds }: StepSpanInput,
  accessToken: string,
): Promise<AddedStep> =>
  apiFetch(stepsPathOf(actId), {
    method: 'POST',
    body: { startSeconds, endSeconds },
    schema: AddedStepSchema,
    accessToken,
  });

export const requestStepName = (
  actId: number,
  { stepId, name }: StepNameInput,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${stepsPathOf(actId)}/${stepId}`, {
    method: 'PUT',
    body: { name },
    schema: NoContentSchema,
    accessToken,
  });

export const requestStepStart = (
  actId: number,
  { stepId, atSeconds }: StepBorderInput,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${stepsPathOf(actId)}/${stepId}/start`, {
    method: 'PUT',
    body: { atSeconds },
    schema: NoContentSchema,
    accessToken,
  });

export const requestStepEnd = (
  actId: number,
  { stepId, atSeconds }: StepBorderInput,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${stepsPathOf(actId)}/${stepId}/end`, {
    method: 'PUT',
    body: { atSeconds },
    schema: NoContentSchema,
    accessToken,
  });

export const requestStepRemoval = (
  actId: number,
  stepId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${stepsPathOf(actId)}/${stepId}`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });

export const requestPartAdd = (
  actId: number,
  { firstStepId, lastStepId, name }: PartOpening,
  accessToken: string,
): Promise<AddedPart> =>
  apiFetch(partsPathOf(actId), {
    method: 'POST',
    body: { firstStepId, lastStepId, name },
    schema: AddedPartSchema,
    accessToken,
  });

export const requestPartSettings = (
  actId: number,
  { partId, settings }: PartSettingsInput,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${partsPathOf(actId)}/${partId}`, {
    method: 'PUT',
    body: {
      name: settings.name,
      firstStepId: settings.firstStepId,
      lastStepId: settings.lastStepId,
      mainVideoId: settings.mainVideoId,
    },
    schema: NoContentSchema,
    accessToken,
  });

export const requestPartRemoval = (
  actId: number,
  partId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${partsPathOf(actId)}/${partId}`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });

export const requestVideoAdd = (
  actId: number,
  mediaItemId: number,
  accessToken: string,
): Promise<AddedVideo> =>
  apiFetch(videosPathOf(actId), {
    method: 'POST',
    body: { mediaItemId },
    schema: AddedVideoSchema,
    accessToken,
  });

export const requestVideoName = (
  actId: number,
  { videoId, name }: VideoNameInput,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${videosPathOf(actId)}/${videoId}`, {
    method: 'PUT',
    body: { name },
    schema: NoContentSchema,
    accessToken,
  });

export const requestVideoStart = (
  actId: number,
  { videoId, startSeconds }: VideoStartInput,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${videosPathOf(actId)}/${videoId}/start`, {
    method: 'PUT',
    body: { atSeconds: startSeconds },
    schema: NoContentSchema,
    accessToken,
  });

export const requestVideoClip = (
  actId: number,
  { videoId, startSeconds, endSeconds }: VideoClipInput,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${videosPathOf(actId)}/${videoId}/clip`, {
    method: 'PUT',
    body: { startSeconds, endSeconds },
    schema: NoContentSchema,
    accessToken,
  });

export const requestVideoSplit = (
  actId: number,
  { videoId, atSeconds }: VideoSplitInput,
  accessToken: string,
): Promise<SplitVideo> =>
  apiFetch(`${videosPathOf(actId)}/${videoId}/split`, {
    method: 'POST',
    body: { atSeconds },
    schema: SplitVideoSchema,
    accessToken,
  });

export const requestVideoAlignment = (
  actId: number,
  videoId: number,
  accessToken: string,
): Promise<VideoAlignment> =>
  apiFetch(`${videosPathOf(actId)}/${videoId}/alignment`, {
    method: 'POST',
    schema: VideoAlignmentSchema,
    accessToken,
  });

export const requestVideoRemoval = (
  actId: number,
  videoId: number,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${videosPathOf(actId)}/${videoId}`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });

const choreographyPathOf = (actId: number): string => `/api/acts/${actId}/choreography`;

const versionsPathOf = (actId: number, before: number | null): string =>
  before === null
    ? `${choreographyPathOf(actId)}/versions`
    : `${choreographyPathOf(actId)}/versions?before=${before}`;

export const requestChoreographyVersions = (
  actId: number,
  before: number | null,
  accessToken: string,
): Promise<ChoreographyVersionPage> =>
  apiFetch(versionsPathOf(actId, before), {
    schema: ChoreographyVersionPageSchema,
    accessToken,
  });

export const requestChoreographyRestore = (
  actId: number,
  version: number,
  accessToken: string,
): Promise<SavedChoreography> =>
  apiFetch(`${choreographyPathOf(actId)}/versions/${version}/restore`, {
    method: 'POST',
    schema: SavedChoreographySchema,
    accessToken,
  });
