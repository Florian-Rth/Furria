import type { JsonBody } from '@/lib/api/api-fetch';
import { apiFetch } from '@/lib/api/api-fetch';
import { NoContentSchema } from '@/lib/api/schemas';
import type {
  AlbumDetails,
  CreatedAlbum,
  GalleryBin,
  GalleryHub,
  InboxesResponse,
  InboxResponse,
  MediaKind,
} from './schemas';
import {
  AlbumDetailsSchema,
  CreatedAlbumSchema,
  GalleryBinSchema,
  GalleryHubSchema,
  InboxesResponseSchema,
  InboxResponseSchema,
} from './schemas';
import type { AlbumPayload, AlbumUpdatePayload, InboxOwner, SelectionPhoto } from './types';

export interface AlbumFilter {
  kind: MediaKind | null;
  uploaderPersonId: number | null;
}

const toAlbumBody = (payload: AlbumPayload): { [key: string]: JsonBody } => ({
  title: payload.title,
  description: payload.description,
  calendarEntryId: payload.calendarEntryId,
  sessionStartYear: payload.sessionStartYear,
});

export const toAlbumQuery = (filter: AlbumFilter): string => {
  const query = new URLSearchParams();
  if (filter.kind !== null) {
    query.set('kind', filter.kind);
  }
  if (filter.uploaderPersonId !== null) {
    query.set('uploaderPersonId', String(filter.uploaderPersonId));
  }
  const text = query.toString();
  return text === '' ? '' : `?${text}`;
};

export const toInboxQuery = (owner: InboxOwner): string => {
  switch (owner.kind) {
    case 'mine':
      return '';
    case 'uploader':
      return `?uploaderPersonId=${owner.personId}`;
    case 'ownerless':
      return '?ownerless=true';
  }
};

export const requestGalleryHub = (accessToken: string): Promise<GalleryHub> =>
  apiFetch('/api/gallery', { schema: GalleryHubSchema, accessToken });

export const requestAlbum = (
  albumId: number,
  filter: AlbumFilter,
  accessToken: string,
): Promise<AlbumDetails> =>
  apiFetch(`/api/gallery/albums/${albumId}${toAlbumQuery(filter)}`, {
    schema: AlbumDetailsSchema,
    accessToken,
  });

export const requestInbox = (owner: InboxOwner, accessToken: string): Promise<InboxResponse> =>
  apiFetch(`/api/gallery/inbox${toInboxQuery(owner)}`, {
    schema: InboxResponseSchema,
    accessToken,
  });

export const requestInboxes = (accessToken: string): Promise<InboxesResponse> =>
  apiFetch('/api/gallery/inboxes', { schema: InboxesResponseSchema, accessToken });

export const requestBin = (accessToken: string): Promise<GalleryBin> =>
  apiFetch('/api/gallery/bin', { schema: GalleryBinSchema, accessToken });

export const requestAlbumCreation = (
  payload: AlbumPayload,
  accessToken: string,
): Promise<CreatedAlbum> =>
  apiFetch('/api/gallery/albums', {
    method: 'POST',
    body: toAlbumBody(payload),
    schema: CreatedAlbumSchema,
    accessToken,
  });

export const requestAlbumUpdate = (
  albumId: number,
  payload: AlbumUpdatePayload,
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/gallery/albums/${albumId}`, {
    method: 'PUT',
    body: { ...toAlbumBody(payload), coverMediaItemId: payload.coverMediaItemId },
    schema: NoContentSchema,
    accessToken,
  });

export const requestAlbumDeletion = (albumId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/gallery/albums/${albumId}`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });

export const requestAlbumRestoration = (albumId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/gallery/albums/${albumId}/restore`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestSelection = (
  albumId: number,
  photos: readonly SelectionPhoto[],
  accessToken: string,
): Promise<void> =>
  apiFetch(`/api/gallery/albums/${albumId}/selection`, {
    method: 'PUT',
    body: {
      photos: photos.map((photo) => ({ mediaItemId: photo.mediaItemId, caption: photo.caption })),
    },
    schema: NoContentSchema,
    accessToken,
  });

export const requestPublication = (albumId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/gallery/albums/${albumId}/publication`, {
    method: 'POST',
    schema: NoContentSchema,
    accessToken,
  });

export const requestUnpublication = (albumId: number, accessToken: string): Promise<void> =>
  apiFetch(`/api/gallery/albums/${albumId}/publication`, {
    method: 'DELETE',
    schema: NoContentSchema,
    accessToken,
  });

export const requestPlacement = (
  albumId: number,
  mediaItemIds: readonly number[],
  accessToken: string,
): Promise<void> =>
  apiFetch('/api/gallery/items/placement', {
    method: 'POST',
    body: { albumId, mediaItemIds: [...mediaItemIds] },
    schema: NoContentSchema,
    accessToken,
  });

export const requestItemDeletion = (
  mediaItemIds: readonly number[],
  accessToken: string,
): Promise<void> =>
  apiFetch('/api/gallery/items/deletion', {
    method: 'POST',
    body: { mediaItemIds: [...mediaItemIds] },
    schema: NoContentSchema,
    accessToken,
  });

export const requestItemRestoration = (
  mediaItemIds: readonly number[],
  accessToken: string,
): Promise<void> =>
  apiFetch('/api/gallery/items/restoration', {
    method: 'POST',
    body: { mediaItemIds: [...mediaItemIds] },
    schema: NoContentSchema,
    accessToken,
  });
