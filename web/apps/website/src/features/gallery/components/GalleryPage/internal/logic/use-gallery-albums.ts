import type { Album, GalleryAlbums } from '@/features/gallery/gallery-content';
import { selectGalleryAlbums } from '@/features/gallery/gallery-content';

export const useGalleryAlbums = (albums: Album[]): GalleryAlbums =>
  selectGalleryAlbums(albums, new Date());
