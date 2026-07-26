import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { newsEyebrow } from '@/features/news/news-content';

export const NewsPageEyebrow: FC = () => (
  <Typography
    variant="overline"
    sx={{ fontWeight: 900, letterSpacing: '0.24em', color: 'redInk.main', lineHeight: 1.4 }}
  >
    {newsEyebrow}
  </Typography>
);
