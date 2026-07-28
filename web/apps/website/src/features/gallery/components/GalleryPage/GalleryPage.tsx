import { KkRule, KkSection, PageLayout } from '@furria/ui';
import Grid from '@mui/material/Grid';
import type { FC } from 'react';
import { AlbumCard } from '@/features/gallery/components/AlbumCard';
import { GalleryHeader } from '@/features/gallery/components/GalleryHeader/GalleryHeader';
import type { Album } from '@/features/gallery/gallery-content';
import {
  currentSessionHeading,
  selectCurrentSessionAlbums,
} from '@/features/gallery/gallery-content';
import { AlbumGrid } from './internal/layout/AlbumGrid';

interface GalleryPageProps {
  albums: Album[];
}

export const GalleryPage: FC<GalleryPageProps> = ({ albums }) => {
  const reference = new Date();
  const currentSessionAlbums = selectCurrentSessionAlbums(albums, reference);

  return (
    <PageLayout>
      <PageLayout.Body>
        <GalleryHeader albums={albums} reference={reference} />
        <KkRule />
        <KkSection>
          <KkSection.Header title={currentSessionHeading} />
          <AlbumGrid>
            {currentSessionAlbums.map((album) => (
              <Grid key={album.slug} size={{ xs: 12, sm: 6, md: 4 }}>
                <AlbumCard album={album} />
              </Grid>
            ))}
          </AlbumGrid>
        </KkSection>
      </PageLayout.Body>
    </PageLayout>
  );
};
