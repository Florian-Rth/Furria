import { KkSection } from '@furria/ui';
import type { FC } from 'react';
import { AlbumCard } from '@/features/gallery/components/AlbumCard';
import { nextAlbumHeading, selectNextAlbum } from '@/features/gallery/gallery-content';
import { usePublicGalleryQuery } from '@/lib/public-gallery/api';
import { NextAlbumFrame } from './internal/layout/NextAlbumFrame';

interface NextAlbumProps {
  currentAlbumId: number;
}

export const NextAlbum: FC<NextAlbumProps> = ({ currentAlbumId }) => {
  const { data: sections = [] } = usePublicGalleryQuery();
  const nextAlbum = selectNextAlbum(sections, currentAlbumId);

  if (nextAlbum === undefined) {
    return null;
  }

  return (
    <KkSection>
      <KkSection.Header title={nextAlbumHeading} />
      <NextAlbumFrame>
        <AlbumCard album={nextAlbum} />
      </NextAlbumFrame>
    </KkSection>
  );
};
