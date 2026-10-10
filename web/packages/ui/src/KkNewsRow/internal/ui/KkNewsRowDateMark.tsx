import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkNewsFit } from '../../../internal/news-surface/news-fit';
import { fitted } from '../../../internal/news-surface/news-fit';

interface KkNewsRowDateMarkProps {
  date: string;
  fit: KkNewsFit;
}

export const KkNewsRowDateMark: FC<KkNewsRowDateMarkProps> = ({ date, fit }) => (
  <Typography
    variant="h2"
    component="span"
    sx={{
      display: fitted(fit, { xs: 'none', desktop: 'block' }),
      color: 'primary.main',
      lineHeight: 1,
      flexShrink: 0,
      minWidth: '4.5rem',
    }}
  >
    {date}
  </Typography>
);
