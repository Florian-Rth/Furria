import { kkTokens } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { buildFeaturedAlbumMeta } from '@/features/gallery/gallery-content';
import type { AlbumSummary } from '@/lib/public-gallery/schemas';

interface FeaturedAlbumMetaProps {
  album: AlbumSummary;
}

export const FeaturedAlbumMeta: FC<FeaturedAlbumMetaProps> = ({ album }) => {
  const meta = buildFeaturedAlbumMeta(album);

  return (
    <Typography
      data-kk-featured-album-meta
      sx={{
        typography: { xs: 'body2', desktop: 'body1' },
        fontWeight: 700,
        letterSpacing: '0.02em',
        color: kkTokens.overlay.onPhotoText,
        opacity: 0.88,
        textWrap: 'pretty',
      }}
    >
      {meta}
    </Typography>
  );
};
