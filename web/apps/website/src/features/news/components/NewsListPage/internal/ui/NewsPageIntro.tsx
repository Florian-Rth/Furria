import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { newsIntro } from '@/features/news/news-content';

export const NewsPageIntro: FC = () => (
  <Typography
    variant="body1"
    sx={{
      color: 'text.secondary',
      fontWeight: 500,
      textWrap: 'pretty',
      maxWidth: '24rem',
    }}
  >
    {newsIntro}
  </Typography>
);
