import { KkPhoto } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';
import {
  albumCoverOrientation,
  buildAlbumCoverAlt,
  buildAlbumSlug,
  buildPhotoSourceSet,
  featuredCoverSizes,
} from '@/features/gallery/gallery-content';
import type { AlbumSummary } from '@/lib/public-gallery/schemas';

interface FeaturedAlbumCoverProps {
  album: AlbumSummary;
}

export const FeaturedAlbumCover: FC<FeaturedAlbumCoverProps> = ({ album }) => {
  const coverAlt = buildAlbumCoverAlt(album);
  const coverSourceSet = buildPhotoSourceSet(album.cover);
  const albumSlug = buildAlbumSlug(album);

  return (
    <Box data-kk-featured-album-cover sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
      <KkPhoto
        alt={coverAlt}
        orientation={albumCoverOrientation}
        placeholderLabel={albumSlug}
        source={album.cover.largeUrl}
        sourceSet={coverSourceSet}
        sizes={featuredCoverSizes}
        sx={{ height: '100%' }}
      />
    </Box>
  );
};
