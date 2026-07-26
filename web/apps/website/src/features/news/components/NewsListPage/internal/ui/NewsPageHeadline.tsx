import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { newsHeading } from '@/features/news/news-content';

export const NewsPageHeadline: FC = () => (
  <Typography variant="h1" component="h1">
    {newsHeading}
  </Typography>
);
