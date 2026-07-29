import { KkHeroSection } from '@furria/ui';
import type { FC } from 'react';
import { PhotoStack } from '@/features/gallery/components/PhotoStack/PhotoStack';
import {
  galleryDescription,
  galleryEyebrow,
  galleryHeading,
} from '@/features/gallery/gallery-content';

export const GalleryHeader: FC = () => (
  <KkHeroSection>
    <KkHeroSection.Main>
      <KkHeroSection.Eyebrow>{galleryEyebrow}</KkHeroSection.Eyebrow>
      <KkHeroSection.Title>{galleryHeading}</KkHeroSection.Title>
      <KkHeroSection.Description>{galleryDescription}</KkHeroSection.Description>
    </KkHeroSection.Main>
    <KkHeroSection.Aside>
      <PhotoStack />
    </KkHeroSection.Aside>
  </KkHeroSection>
);
