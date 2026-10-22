import type { KkStartTileCover } from '@furria/ui/KkStartTileCovers';
import type { KkStartTileReach } from '@furria/ui/reach';
import { Link, useNavigate } from '@tanstack/react-router';
import { GALLERY_PATH } from '@/features/session/app-sections';
import type { StartAlbum } from '../schemas';
import type { StartPanelOf } from '../start-board';
import { toGalleryShelfEdge } from '../start-labels';

export interface GalleryTileView {
  reach: KkStartTileReach;
  covers: KkStartTileCover[];
  title: string | null;
  meta: string | null;
}

const ALBUM_ROUTE = '/gallery/$albumId';
const SHOWN_COVERS = 3;
const META_SEPARATOR = ' · ';

const albumMetaOf = (albums: readonly StartAlbum[]): string | null => {
  const [newest, ...older] = albums;

  if (newest === undefined) {
    return null;
  }

  return [
    toGalleryShelfEdge(newest.itemCount),
    ...(older.length === 0 ? [] : [`+${older.length} ${older.length === 1 ? 'Album' : 'Alben'}`]),
  ].join(META_SEPARATOR);
};

export const useGalleryTile = (panel: StartPanelOf<'gallery'>): GalleryTileView => {
  const navigate = useNavigate();
  const albums = panel.albums.slice(0, panel.shownCount);

  return {
    reach: { label: 'Zur Galerie', component: Link, to: GALLERY_PATH },
    covers: albums.slice(0, SHOWN_COVERS).map((album) => ({
      id: String(album.albumId),
      image: album.cover?.state === 'ready' ? { src: album.cover.urls.small } : null,
      title: album.title,
      label: `${album.title} öffnen`,
      onSelect: () => {
        void navigate({ to: ALBUM_ROUTE, params: { albumId: String(album.albumId) }, search: {} });
      },
    })),
    title: albums[0]?.title ?? null,
    meta: albumMetaOf(albums),
  };
};
