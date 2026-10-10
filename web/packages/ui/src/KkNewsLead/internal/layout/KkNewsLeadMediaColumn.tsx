import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';
import type { KkNewsFit } from '../../../internal/news-surface/news-fit';
import { fitted } from '../../../internal/news-surface/news-fit';

interface KkNewsLeadMediaColumnProps extends PropsWithChildren {
  fit: KkNewsFit;
}

export const KkNewsLeadMediaColumn: FC<KkNewsLeadMediaColumnProps> = ({ fit, children }) => (
  <Grid data-kk-news-lead-media size={fitted(fit, { xs: 12, md: 6 })}>
    {children}
  </Grid>
);
