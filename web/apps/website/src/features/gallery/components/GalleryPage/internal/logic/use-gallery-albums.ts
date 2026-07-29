import type { Album, AlbumSessionGroup } from '@/features/gallery/gallery-content';
import {
  excludeAlbum,
  selectCurrentSessionAlbums,
  selectFeaturedAlbum,
  selectOlderSessionGroups,
} from '@/features/gallery/gallery-content';

export interface GalleryAlbums {
  featuredAlbum: Album | undefined;
  currentSessionAlbums: Album[];
  olderSessionGroups: AlbumSessionGroup[];
}

export const selectGalleryAlbums = (albums: Album[], reference: Date): GalleryAlbums => {
  const featuredAlbum = selectFeaturedAlbum(albums);
  const remainingAlbums = excludeAlbum(albums, featuredAlbum);

  return {
    featuredAlbum,
    currentSessionAlbums: selectCurrentSessionAlbums(remainingAlbums, reference),
    olderSessionGroups: selectOlderSessionGroups(remainingAlbums, reference),
  };
};

export const useGalleryAlbums = (albums: Album[]): GalleryAlbums =>
  selectGalleryAlbums(albums, new Date());
