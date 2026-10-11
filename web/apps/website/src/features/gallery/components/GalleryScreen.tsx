import type { FC } from 'react';
import { GalleryLoading } from '@/features/gallery/components/GalleryLoading';
import { GalleryPage } from '@/features/gallery/components/GalleryPage/GalleryPage';
import { GalleryUnavailable } from '@/features/gallery/components/GalleryUnavailable';
import { publicGallery } from '@/lib/public-gallery/api';

export const GalleryScreen: FC = () => {
  const source = publicGallery.useSource();

  if (source.status === 'loading') {
    return <GalleryLoading />;
  }

  if (source.status === 'error') {
    return <GalleryUnavailable onRetry={source.retry} />;
  }

  return <GalleryPage sections={source.data} />;
};
