import { KkPhoto } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { Album } from '@/features/gallery/gallery-content';
import {
  albumCoverOrientation,
  buildAlbumCoverAlt,
  buildAlbumCoverSource,
} from '@/features/gallery/gallery-content';

interface FeaturedAlbumCoverProps {
  album: Album;
}

export const FeaturedAlbumCover: FC<FeaturedAlbumCoverProps> = ({ album }) => {
  const coverAlt = buildAlbumCoverAlt(album);
  const coverSource = buildAlbumCoverSource(album);

  return (
    <Box data-kk-featured-album-cover sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <KkPhoto
        alt={coverAlt}
        orientation={albumCoverOrientation}
        placeholderLabel={album.slug}
        source={coverSource}
        sx={{ height: '100%' }}
      />
    </Box>
  );
};
