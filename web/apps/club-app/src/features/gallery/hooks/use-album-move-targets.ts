import { moveTargetMeta } from '../album-labels';
import { useGalleryHubQuery } from '../api';

export interface AlbumMoveTarget {
  albumId: number;
  title: string;
  meta: string;
}

export const useAlbumMoveTargets = (currentAlbumId: number): AlbumMoveTarget[] => {
  const hub = useGalleryHubQuery();
  const albums = hub.data?.sections.flatMap((section) => section.albums) ?? [];

  return albums
    .filter((album) => album.albumId !== currentAlbumId)
    .map((album) => ({
      albumId: album.albumId,
      title: album.title,
      meta: moveTargetMeta(album.sessionStartYear, album.photos + album.videos),
    }));
};
