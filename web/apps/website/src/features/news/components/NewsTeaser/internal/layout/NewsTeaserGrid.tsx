import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const NewsTeaserGrid: FC<PropsWithChildren> = ({ children }) => (
  <Grid data-kk-news-teaser-grid container spacing={{ xs: 2, md: 2.5 }}>
    {children}
  </Grid>
);
