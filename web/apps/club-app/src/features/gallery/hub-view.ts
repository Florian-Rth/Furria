import { countsLine, dayLabel, type MediaCounts } from './gallery-view';
import type { GalleryHubAlbum, GalleryMedia, InboxSummary } from './schemas';
import type { InboxOwner } from './types';

export const NEW_ALBUM_DAYS = 14;
const DAY_MS = 86_400_000;

export type HubAlbumMark =
  | { kind: 'published' }
  | { kind: 'new' }
  | { kind: 'selection'; count: number }
  | { kind: 'none' };

export const isNewAlbum = (album: Pick<GalleryHubAlbum, 'createdAt'>, now: Date): boolean =>
  now.getTime() - Date.parse(album.createdAt) < NEW_ALBUM_DAYS * DAY_MS;

export const albumMarkOf = (
  album: Pick<GalleryHubAlbum, 'createdAt' | 'isPublished' | 'selectionCount'>,
  now: Date,
  showsSelection: boolean,
): HubAlbumMark => {
  if (album.isPublished) {
    return { kind: 'published' };
  }
  if (isNewAlbum(album, now)) {
    return { kind: 'new' };
  }
  if (showsSelection && album.selectionCount > 0) {
    return { kind: 'selection', count: album.selectionCount };
  }
  return { kind: 'none' };
};

export const stripMediaOf = (album: Pick<GalleryHubAlbum, 'cover' | 'samples'>): GalleryMedia[] => {
  const { cover, samples } = album;
  if (cover === null) {
    return [...samples];
  }
  return [cover, ...samples.filter((sample) => sample.mediaItemId !== cover.mediaItemId)];
};

export const sectionCountsOf = (
  albums: readonly Pick<GalleryHubAlbum, 'photos' | 'videos'>[],
): MediaCounts => ({
  photos: albums.reduce((sum, album) => sum + album.photos, 0),
  videos: albums.reduce((sum, album) => sum + album.videos, 0),
});

export const albumMetaOf = (
  album: Pick<GalleryHubAlbum, 'entryStartsAt' | 'photos' | 'videos'>,
): string => {
  const counts = countsLine(album);
  const day = dayLabel(album.entryStartsAt);
  return day === null ? counts : `${day} · ${counts}`;
};

export const newestAlbumsOf = (
  albums: readonly GalleryHubAlbum[],
  count: number,
): GalleryHubAlbum[] =>
  [...albums].sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, count);

export const inboxOwnerOf = (inbox: Pick<InboxSummary, 'uploader'>): InboxOwner =>
  inbox.uploader === null
    ? { kind: 'ownerless' }
    : { kind: 'uploader', personId: inbox.uploader.personId };

export const inboxKeyOf = (owner: InboxOwner): string => {
  switch (owner.kind) {
    case 'mine':
      return 'mine';
    case 'uploader':
      return `uploader-${owner.personId}`;
    case 'ownerless':
      return 'ownerless';
  }
};

export const ownInboxFirst = (
  inboxes: readonly InboxSummary[],
  personId: number | null,
): InboxSummary[] =>
  [...inboxes].sort((left, right) => {
    const leftOwn = left.uploader !== null && left.uploader.personId === personId ? 0 : 1;
    const rightOwn = right.uploader !== null && right.uploader.personId === personId ? 0 : 1;
    return leftOwn - rightOwn || right.latestUploadedAt.localeCompare(left.latestUploadedAt);
  });
