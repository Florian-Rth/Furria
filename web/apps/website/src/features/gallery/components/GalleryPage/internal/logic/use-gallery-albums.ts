import type { GalleryAlbums } from '@/features/gallery/gallery-content';
import { selectGalleryAlbums } from '@/features/gallery/gallery-content';
import type { GallerySection } from '@/lib/public-gallery/schemas';

export const useGalleryAlbums = (sections: GallerySection[]): GalleryAlbums =>
  selectGalleryAlbums(sections, new Date());
