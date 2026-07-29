import { KkSection } from '@furria/ui';
import type { FC } from 'react';
import { AlbumCard } from '@/features/gallery/components/AlbumCard';
import { ALBUMS, nextAlbumHeading, selectNextAlbum } from '@/features/gallery/gallery-content';
import { NextAlbumFrame } from './internal/layout/NextAlbumFrame';

interface NextAlbumProps {
  currentSlug: string;
}

export const NextAlbum: FC<NextAlbumProps> = ({ currentSlug }) => {
  const nextAlbum = selectNextAlbum(ALBUMS, currentSlug);

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
