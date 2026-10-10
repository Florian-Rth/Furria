import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkNewsCopy } from '../../../internal/news-surface/KkNewsCopy';
import type { KkNewsFit } from '../../../internal/news-surface/news-fit';
import { fitted } from '../../../internal/news-surface/news-fit';

interface KkNewsRowHeadlineProps {
  title: string | null;
  fit: KkNewsFit;
}

export const KkNewsRowHeadline: FC<KkNewsRowHeadlineProps> = ({ title, fit }) => (
  <Typography
    variant="h3"
    component="h3"
    data-kk-news-title
    sx={(theme) => ({
      typography: fitted(fit, { xs: 'h3', md: 'h2' }),
      lineHeight: 1.05,
      transition: theme.transitions.create(['color'], {
        duration: theme.transitions.duration.shortest,
      }),
    })}
  >
    <KkNewsCopy text={title} kind="title" />
  </Typography>
);
