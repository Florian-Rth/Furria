import { kkTokens } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { Album } from '@/features/gallery/gallery-content';

interface FeaturedAlbumTitleProps {
  album: Album;
}

export const FeaturedAlbumTitle: FC<FeaturedAlbumTitleProps> = ({ album }) => (
  <Typography
    variant="h2"
    component="h2"
    data-kk-featured-album-title
    sx={{
      typography: { xs: 'h1', desktop: 'display' },
      lineHeight: 0.96,
      overflowWrap: 'anywhere',
      color: kkTokens.overlay.onPhotoText,
      textShadow: kkTokens.overlay.textShadow,
    }}
  >
    {album.title}
  </Typography>
);
