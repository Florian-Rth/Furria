import type { KkAlbumShelfAlbum } from '@furria/ui';
import { useNavigate } from '@tanstack/react-router';
import { GALLERY_PATH } from '@/features/session';
import type { StartAlbum } from '../schemas';
import type { StartPanelOf } from '../start-board';
import { toGalleryShelfEdge } from '../start-labels';

const ALBUM_ROUTE = '/gallery/$albumId';

export interface GalleryPanelView {
  albums: KkAlbumShelfAlbum[];
  openGallery: () => void;
}

export const useGalleryPanel = (panel: StartPanelOf<'gallery'>): GalleryPanelView => {
  const navigate = useNavigate();

  const toShelfAlbum = (album: StartAlbum): KkAlbumShelfAlbum => ({
    id: String(album.albumId),
    title: album.title,
    label: `${album.title} öffnen`,
    edge: toGalleryShelfEdge(album.itemCount),
    source: album.cover?.state === 'ready' ? album.cover.urls.small : undefined,
    fresh: true,
    onSelect: () => {
      void navigate({ to: ALBUM_ROUTE, params: { albumId: String(album.albumId) }, search: {} });
    },
  });

  return {
    albums: panel.albums.slice(0, panel.shownCount).map(toShelfAlbum),
    openGallery: () => {
      void navigate({ to: GALLERY_PATH });
    },
  };
};
