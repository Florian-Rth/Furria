import Link from '@mui/material/Link';
import { Link as RouterLink } from '@tanstack/react-router';
import type { FC } from 'react';
import { allNewsLabel } from '@/features/news/news-content';

export const NewsTeaserAllLink: FC = () => (
  <Link
    component={RouterLink}
    to="/news"
    underline="hover"
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      minHeight: '2.75rem',
      color: 'primary.main',
      fontWeight: 800,
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}
  >
    {allNewsLabel}
  </Link>
);
