import type { GallerySource } from '@/features/gallery/gallery-source';
import { resolveGallerySource } from '@/features/gallery/gallery-source';
import { usePublicGalleryQuery } from '@/lib/public-gallery/api';

export const useGallerySource = (): GallerySource => {
  const { data, isError, refetch } = usePublicGalleryQuery();

  const retry = (): void => {
    void refetch();
  };

  return resolveGallerySource(data, isError, retry);
};
