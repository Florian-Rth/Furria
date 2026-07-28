import { KkHeroSection } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import { PhotoStack } from '@/features/gallery/components/PhotoStack/PhotoStack';
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
    <KkHeroSection.Aside>
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          alignItems: { xs: 'flex-end', desktop: 'flex-start' },
          justifyContent: 'flex-end',
          pt: { desktop: 3 },
        }}
      >
        <PhotoStack />
      </Box>
    </KkHeroSection.Aside>
  </KkHeroSection>
);
