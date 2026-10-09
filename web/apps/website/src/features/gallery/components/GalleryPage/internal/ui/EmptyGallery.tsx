import { KkEmptyState } from '@furria/ui';
import type { FC } from 'react';
import { emptyGalleryDescription, emptyGalleryTitle } from '@/features/gallery/gallery-content';
import type { AlbumSummary } from '@/lib/public-gallery/schemas';

interface EmptyGalleryProps {
  featuredAlbum: AlbumSummary | undefined;
}

export const EmptyGallery: FC<EmptyGalleryProps> = ({ featuredAlbum }) => {
  if (featuredAlbum !== undefined) {
    return null;
  }

  return <KkEmptyState title={emptyGalleryTitle} description={emptyGalleryDescription} />;
};
