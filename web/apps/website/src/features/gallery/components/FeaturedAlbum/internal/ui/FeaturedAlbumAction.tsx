import { kkTokens } from '@furria/ui';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { albumLinkLabel } from '@/features/gallery/gallery-content';

export const FeaturedAlbumAction: FC = () => (
  <Typography
    component="span"
    data-kk-featured-album-action
    sx={(theme) => ({
      alignSelf: { xs: 'flex-start', desktop: 'flex-end' },
      flexShrink: 0,
      fontWeight: 900,
      fontSize: { xs: '0.9375rem', desktop: '1rem' },
      whiteSpace: 'nowrap',
      color: kkTokens.overlay.onPhotoText,
      borderBottom: kkTokens.line.section,
      borderColor: 'primary.main',
      pb: 0.25,
      transition: theme.transitions.create(['transform'], {
        duration: theme.transitions.duration.shortest,
      }),
    })}
  >
    {albumLinkLabel}
  </Typography>
);
