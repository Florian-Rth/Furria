import Link from '@mui/material/Link';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { backToListLabel } from '@/features/news/news-content';

export const NewsPostBackLink: FC = () => (
  <Link
    component={RouterLink}
    to="/news"
    underline="none"
    data-kk-news-back
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
    {backToListLabel}
  </Link>
);
