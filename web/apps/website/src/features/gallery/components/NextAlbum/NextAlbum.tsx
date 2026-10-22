import { KkSection } from '@furria/ui/KkSection';
import type { FC } from 'react';
import { AlbumCard } from '@/features/gallery/components/AlbumCard';
import { nextAlbumHeading, selectNextAlbum } from '@/features/gallery/gallery-content';
import { publicGallery } from '@/lib/public-gallery/api';
import { readySourceData } from '@/lib/public-resource/public-source';
import { NextAlbumFrame } from './internal/layout/NextAlbumFrame';

interface NextAlbumProps {
  currentAlbumId: number;
}

export const NextAlbum: FC<NextAlbumProps> = ({ currentAlbumId }) => {
  const sections = readySourceData(publicGallery.useSource()) ?? [];
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
