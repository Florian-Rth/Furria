import Link from '@mui/material/Link';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { albumBackLinkLabel } from '@/features/gallery/gallery-content';

export const AlbumBackLink: FC = () => (
  <Link
    component={RouterLink}
    to="/gallery"
    underline="none"
    data-kk-album-back
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      minHeight: '2.75rem',
      color: 'primary.main',
      fontWeight: 800,
      fontSize: '0.875rem',
      '&:focus-visible': {
        outlineWidth: 2,
        outlineStyle: 'solid',
        outlineColor: 'currentColor',
        outlineOffset: 2,
      },
    }}
  >
    {albumBackLinkLabel}
  </Link>
);
