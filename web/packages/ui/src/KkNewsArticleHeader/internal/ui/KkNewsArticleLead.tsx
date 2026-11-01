import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkNewsFit } from '../../../internal/news-surface/news-fit';
import { fitted } from '../../../internal/news-surface/news-fit';

interface KkNewsArticleLeadProps {
  teaser: string;
  fit?: KkNewsFit;
}

export const KkNewsArticleLead: FC<KkNewsArticleLeadProps> = ({ teaser, fit = 'page' }) => (
  <Typography
    component="p"
    data-kk-news-lead
    sx={{
      typography: fitted(fit, { xs: 'h3', md: 'h2' }),
      lineHeight: 1.26,
      letterSpacing: '0.01em',
      color: 'text.secondary',
      textWrap: 'pretty',
    }}
  >
    {teaser}
  </Typography>
);
