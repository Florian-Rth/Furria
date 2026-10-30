import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type { AddedSong } from './schemas';
import { AddedSongSchema } from './schemas';
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
