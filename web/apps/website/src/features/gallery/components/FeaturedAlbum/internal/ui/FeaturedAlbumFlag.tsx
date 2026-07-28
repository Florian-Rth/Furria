import { kkTokens } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { featuredAlbumFlag } from '@/features/gallery/gallery-content';

export const FeaturedAlbumFlag: FC = () => (
  <Typography
    variant="overline"
    component="span"
    data-kk-featured-album-flag
    sx={{
      ...kkTokens.eyebrow,
      bgcolor: 'primary.main',
      color: 'primary.contrastText',
      px: 1.25,
      py: 0.25,
      borderRadius: `${kkTokens.radius.chip}px`,
    }}
  >
    {featuredAlbumFlag}
  </Typography>
);
