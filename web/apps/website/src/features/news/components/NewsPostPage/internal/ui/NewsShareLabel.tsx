import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { shareLabel } from '@/features/news/news-content';

export const NewsShareLabel: FC = () => (
  <Typography
    component="span"
    variant="overline"
    sx={{ fontWeight: 900, letterSpacing: '0.18em', color: 'text.secondary', lineHeight: 1 }}
  >
    {shareLabel}
  </Typography>
);
