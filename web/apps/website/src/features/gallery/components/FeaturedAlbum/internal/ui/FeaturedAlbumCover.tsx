import { KkPhoto, toImageSource } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import {
  albumCoverOrientation,
  buildAlbumCoverAlt,
  featuredCoverSizes,
} from '@/features/gallery/gallery-content';
import { publicGallery } from '@/lib/public-gallery/api';
import type { AlbumSummary } from '@/lib/public-gallery/schemas';

interface FeaturedAlbumCoverProps {
  album: AlbumSummary;
}

export const FeaturedAlbumCover: FC<FeaturedAlbumCoverProps> = ({ album }) => {
  const coverAlt = buildAlbumCoverAlt(album);
  const cover = toImageSource(album.cover, album.cover.aspect, featuredCoverSizes);
  const albumSlug = publicGallery.slugOf(album);

  return (
    <Box data-kk-featured-album-cover sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <KkPhoto
        alt={coverAlt}
        orientation={albumCoverOrientation}
        placeholderLabel={albumSlug}
        image={cover}
        sx={{ height: '100%' }}
      />
    </Box>
  );
};
