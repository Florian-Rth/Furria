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

export const FeaturedAlbumCover: FC<FeaturedAlbumCoverProps> = ({ album }) => (
  <Box data-kk-featured-album-cover sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
    <KkPhoto
      alt={buildAlbumCoverAlt(album)}
      orientation={albumCoverOrientation}
      placeholderLabel={album.slug}
      source={buildAlbumCoverSource(album)}
      sx={{ height: '100%' }}
    />
  </Box>
);
