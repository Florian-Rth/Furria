import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const NewsLeadMediaColumn: FC<PropsWithChildren> = ({ children }) => (
  <Grid data-kk-news-lead-media size={{ xs: 12, md: 6 }}>
    {children}
  </Grid>
);
