import type { Choreography } from '@/features/acts/schemas';
import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type {
  AddedPart,
  AddedSong,
  AddedSpot,
  AddedVideo,
  MarkedSteps,
  SavedChoreography,
  VideoAlignment,
} from './schemas';
import {
  AddedPartSchema,
  AddedSongSchema,
  AddedSpotSchema,
  AddedVideoSchema,
  MarkedStepsSchema,
  SavedChoreographySchema,
  VideoAlignmentSchema,
} from './schemas';
import type { SongSettings } from './studio-music';
import type { PartOpening, PartSettingsInput, StepStartInput, StepTextInput } from './studio-steps';
import type { VideoNameInput, VideoStartInput } from './studio-videos';

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
  expectedVersion: number | null,
  tracks: Choreography['tracks'],
  accessToken: string,
): Promise<SavedChoreography> =>
  apiFetch(`/api/acts/${actId}/choreography`, {
    method: 'PUT',
    body: { expectedVersion, tracks },
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

export const requestStepMark = (
  actId: number,
  atSeconds: number,
  accessToken: string,
): Promise<MarkedSteps> =>
  apiFetch(stepsPathOf(actId), {
    method: 'POST',
    body: { atSeconds },
    schema: MarkedStepsSchema,
    accessToken,
  });

export const requestStepText = (
  actId: number,
  { stepId, name, description }: StepTextInput,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${stepsPathOf(actId)}/${stepId}`, {
    method: 'PUT',
    body: { name, description },
    schema: NoContentSchema,
    accessToken,
  });

export const requestStepStart = (
  actId: number,
  { stepId, atSeconds }: StepStartInput,
  accessToken: string,
): Promise<void> =>
  apiFetch(`${stepsPathOf(actId)}/${stepId}/start`, {
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
  { firstStepId, name }: PartOpening,
  accessToken: string,
): Promise<AddedPart> =>
  apiFetch(partsPathOf(actId), {
    method: 'POST',
    body: { firstStepId, name },
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
