import { kkTokens } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { Album } from '@/features/gallery/gallery-content';
import { buildFeaturedAlbumMeta } from '@/features/gallery/gallery-content';

interface FeaturedAlbumMetaProps {
  album: Album;
}

export const FeaturedAlbumMeta: FC<FeaturedAlbumMetaProps> = ({ album }) => (
  <Typography
    data-kk-featured-album-meta
    sx={{
      fontWeight: 700,
      fontSize: { xs: '0.8125rem', desktop: '0.9375rem' },
      letterSpacing: '0.02em',
      color: kkTokens.overlay.onPhotoText,
      opacity: 0.88,
      textWrap: 'pretty',
    }}
  >
    {buildFeaturedAlbumMeta(album)}
  </Typography>
);
