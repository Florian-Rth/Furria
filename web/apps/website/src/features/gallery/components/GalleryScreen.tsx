import type { FC } from 'react';
import { GalleryLoading } from '@/features/gallery/components/GalleryLoading';
import { GalleryPage } from '@/features/gallery/components/GalleryPage/GalleryPage';
import { GalleryUnavailable } from '@/features/gallery/components/GalleryUnavailable';
import { useGallerySource } from '@/features/gallery/hooks/use-gallery-source';

export const GalleryScreen: FC = () => {
  const source = useGallerySource();

  if (source.status === 'loading') {
    return <GalleryLoading />;
  }

  if (source.status === 'error') {
    return <GalleryUnavailable onRetry={source.retry} />;
  }

  return <GalleryPage sections={source.sections} />;
};
