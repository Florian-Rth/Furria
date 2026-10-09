import { KkRule, PageLayout } from '@furria/ui';
import type { FC } from 'react';
import { GalleryEventsBand } from '@/features/gallery/components/GalleryEventsBand/GalleryEventsBand';
import { GalleryHeader } from '@/features/gallery/components/GalleryHeader/GalleryHeader';
import { GalleryRightsNote } from '@/features/gallery/components/GalleryRightsNote';
import { OlderSessions } from '@/features/gallery/components/OlderSessions/OlderSessions';
import type { GallerySection } from '@/lib/public-gallery/schemas';
import { useGalleryAlbums } from './internal/logic/use-gallery-albums';
import { CurrentSessionAlbums } from './internal/ui/CurrentSessionAlbums';
import { EmptyGallery } from './internal/ui/EmptyGallery';
import { FeaturedAlbumBanner } from './internal/ui/FeaturedAlbumBanner';

interface GalleryPageProps {
  sections: GallerySection[];
}

export const GalleryPage: FC<GalleryPageProps> = ({ sections }) => {
  const { featuredAlbum, currentSessionAlbums, olderSessionGroups } = useGalleryAlbums(sections);

  return (
    <PageLayout>
      <PageLayout.Body>
        <GalleryHeader />
        <KkRule />
        <EmptyGallery featuredAlbum={featuredAlbum} />
        <FeaturedAlbumBanner album={featuredAlbum} />
        <CurrentSessionAlbums albums={currentSessionAlbums} />
        <OlderSessions groups={olderSessionGroups} />
        <GalleryRightsNote />
      </PageLayout.Body>
      <GalleryEventsBand />
    </PageLayout>
  );
};
