import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { newsEmptyNote } from '@/features/news/news-content';

export const NewsEmptyPanel: FC = () => (
  <Card data-kk-news-empty sx={{ px: { xs: 3, md: 5 }, py: { xs: 5, md: 7 }, textAlign: 'center' }}>
    <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
      {newsEmptyNote}
    </Typography>
  </Card>
);
