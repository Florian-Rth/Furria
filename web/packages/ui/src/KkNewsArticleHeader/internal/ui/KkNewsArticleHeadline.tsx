import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkNewsFit } from '../../../internal/news-surface/news-fit';

const HEADLINE_VARIANTS = { page: 'display', column: 'h1' } as const;

interface KkNewsArticleHeadlineProps {
  title: string;
  fit?: KkNewsFit;
}

export const KkNewsArticleHeadline: FC<KkNewsArticleHeadlineProps> = ({ title, fit = 'page' }) => (
  <Typography
    variant={HEADLINE_VARIANTS[fit]}
    component="h1"
    sx={{ lineHeight: 0.96, hyphens: 'auto', overflowWrap: 'anywhere' }}
  >
    {title}
  </Typography>
);
