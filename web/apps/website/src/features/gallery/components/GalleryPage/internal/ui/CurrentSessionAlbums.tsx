import { KkSection } from '@furria/ui';
import type { FC } from 'react';
import { AlbumCard } from '@/features/gallery/components/AlbumCard';
import type { Album } from '@/features/gallery/gallery-content';
import { currentSessionHeading } from '@/features/gallery/gallery-content';
import { AlbumGrid } from '../layout/AlbumGrid';
import { AlbumGridItem } from '../layout/AlbumGridItem';

interface CurrentSessionAlbumsProps {
  albums: Album[];
}

export const CurrentSessionAlbums: FC<CurrentSessionAlbumsProps> = ({ albums }) => {
  if (albums.length === 0) {
    return null;
  }

  return (
    <KkSection>
      <KkSection.Header title={currentSessionHeading} />
      <AlbumGrid>
        {albums.map((album) => (
          <AlbumGridItem key={album.slug}>
            <AlbumCard album={album} />
          </AlbumGridItem>
        ))}
      </AlbumGrid>
    </KkSection>
  );
};
