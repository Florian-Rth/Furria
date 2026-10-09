import type { KkAlbumShelfAlbum } from '@furria/ui';
import { useNavigate } from '@tanstack/react-router';
import { sceneMeta } from '../album-labels';
import { useGalleryHubQuery } from '../api';
import { ALBUM_ROUTE } from '../gallery-copy';
import { shownSourceOf } from '../gallery-view';
import { isNewAlbum, newestAlbumsOf } from '../hub-view';
import type { GalleryHubAlbum } from '../schemas';

export const useNewestAlbumsShelf = (count: number): KkAlbumShelfAlbum[] | undefined => {
  const navigate = useNavigate();
  const hub = useGalleryHubQuery();
  const now = new Date();

  if (hub.data === undefined) {
    return undefined;
  }

  const toShelfAlbum = (album: GalleryHubAlbum): KkAlbumShelfAlbum => ({
    id: String(album.albumId),
    title: album.title,
    label: `${album.title} öffnen`,
    edge: sceneMeta(album.photos + album.videos),
    source: album.cover === null ? undefined : shownSourceOf(album.cover),
    fresh: isNewAlbum(album, now),
    onSelect: () => {
      void navigate({ to: ALBUM_ROUTE, params: { albumId: String(album.albumId) }, search: {} });
    },
  });

  const albums = hub.data.sections.flatMap((section) => section.albums);
  return newestAlbumsOf(albums, count).map(toShelfAlbum);
};
