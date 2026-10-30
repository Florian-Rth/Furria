import type { Choreography } from '@/features/acts/schemas';
import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { AddedSong, AddedSpot, SavedChoreography } from './schemas';
import { AddedSongSchema, AddedSpotSchema, SavedChoreographySchema } from './schemas';
import type { SongSettings } from './studio-music';

const songsPathOf = (actId: number): string => `/api/acts/${actId}/songs`;

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
