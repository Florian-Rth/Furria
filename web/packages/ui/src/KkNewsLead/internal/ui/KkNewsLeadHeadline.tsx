import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkNewsCopy } from '../../../internal/news-surface/KkNewsCopy';
import type { KkNewsFit } from '../../../internal/news-surface/news-fit';
import { fitted } from '../../../internal/news-surface/news-fit';

interface KkNewsLeadHeadlineProps {
  title: string | null;
  fit: KkNewsFit;
}

export const KkNewsLeadHeadline: FC<KkNewsLeadHeadlineProps> = ({ title, fit }) => (
  <Typography
    variant="h1"
    component="h2"
    data-kk-news-title
    sx={(theme) => ({
      typography: fitted(fit, { xs: 'h1', md: 'display' }),
      lineHeight: 0.96,
      transition: theme.transitions.create(['color'], {
        duration: theme.transitions.duration.shortest,
      }),
    })}
  >
    <KkNewsCopy text={title} kind="title" />
  </Typography>
);
