import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { newsIntro } from '@/features/news/news-content';

export const NewsPageIntro: FC = () => (
  <Typography
    variant="subtitle1"
    component="p"
    sx={{
      color: 'text.secondary',
      fontSize: { xs: '1.125rem', md: '1.375rem' },
      lineHeight: 1.45,
      textWrap: 'pretty',
      maxWidth: 'sm',
    }}
  >
    {newsIntro}
  </Typography>
);
