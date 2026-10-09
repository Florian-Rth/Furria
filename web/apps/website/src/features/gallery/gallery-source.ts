import type { GallerySection } from '@/lib/public-gallery/schemas';

export type GallerySource =
  | { status: 'loading' }
  | { status: 'error'; retry: () => void }
  | { status: 'ready'; sections: GallerySection[] };

export const resolveGallerySource = (
  sections: GallerySection[] | undefined,
  hasFailed: boolean,
  retry: () => void,
): GallerySource => {
  if (sections !== undefined) {
    return { status: 'ready', sections };
  }

  return hasFailed ? { status: 'error', retry } : { status: 'loading' };
};
