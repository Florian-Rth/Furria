import { KkHeroSection } from '@furria/ui';
import type { FC } from 'react';
import type { Album } from '@/features/gallery/gallery-content';
import {
  buildGalleryStats,
  galleryDescription,
  galleryEyebrow,
  galleryHeading,
} from '@/features/gallery/gallery-content';
import { GalleryStatRow } from './internal/ui/GalleryStatRow';

interface GalleryHeaderProps {
  albums: Album[];
  reference: Date;
}

export const GalleryHeader: FC<GalleryHeaderProps> = ({ albums, reference }) => (
  <KkHeroSection>
    <KkHeroSection.Main>
      <KkHeroSection.Eyebrow>{galleryEyebrow}</KkHeroSection.Eyebrow>
      <KkHeroSection.Title>{galleryHeading}</KkHeroSection.Title>
      <KkHeroSection.Description>{galleryDescription}</KkHeroSection.Description>
      <GalleryStatRow stats={buildGalleryStats(albums, reference)} />
    </KkHeroSection.Main>
  </KkHeroSection>
);
