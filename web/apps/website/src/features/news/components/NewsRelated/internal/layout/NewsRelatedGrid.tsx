import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const NewsRelatedGrid: FC<PropsWithChildren> = ({ children }) => (
  <Grid data-kk-news-related-grid container spacing={{ xs: 2, md: 2.5 }}>
    {children}
  </Grid>
);
