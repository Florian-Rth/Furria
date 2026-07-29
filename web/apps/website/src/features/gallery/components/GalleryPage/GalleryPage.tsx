import { KkRule, PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { GalleryHeader } from '@/features/gallery/components/GalleryHeader/GalleryHeader';
import { GalleryProgramBand } from '@/features/gallery/components/GalleryProgramBand/GalleryProgramBand';
import { GalleryRightsNote } from '@/features/gallery/components/GalleryRightsNote';
import { OlderSessions } from '@/features/gallery/components/OlderSessions/OlderSessions';
import type { Album } from '@/features/gallery/gallery-content';
import { useGalleryAlbums } from './internal/logic/use-gallery-albums';
import { CurrentSessionAlbums } from './internal/ui/CurrentSessionAlbums';
import { FeaturedAlbumBanner } from './internal/ui/FeaturedAlbumBanner';

interface GalleryPageProps {
  albums: Album[];
}

export const GalleryPage: FC<GalleryPageProps> = ({ albums }) => {
  const { featuredAlbum, currentSessionAlbums, olderSessionGroups } = useGalleryAlbums(albums);

  return (
    <PageLayout>
      <PageLayout.Body>
        <GalleryHeader />
        <KkRule />
        <FeaturedAlbumBanner album={featuredAlbum} />
        <CurrentSessionAlbums albums={currentSessionAlbums} />
        <OlderSessions groups={olderSessionGroups} />
        <GalleryRightsNote />
      </PageLayout.Body>
      <GalleryProgramBand />
    </PageLayout>
  );
};
