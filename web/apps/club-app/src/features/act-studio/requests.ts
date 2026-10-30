import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { AddedPart, AddedSong, MarkedSteps } from './schemas';
import { AddedPartSchema, AddedSongSchema, MarkedStepsSchema } from './schemas';
import type { SongSettings } from './studio-music';
import type { PartOpening, PartSettingsInput, StepStartInput, StepTextInput } from './studio-steps';

const songsPathOf = (actId: number): string => `/api/acts/${actId}/songs`;
const stepsPathOf = (actId: number): string => `/api/acts/${actId}/steps`;
const partsPathOf = (actId: number): string => `/api/acts/${actId}/parts`;

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
