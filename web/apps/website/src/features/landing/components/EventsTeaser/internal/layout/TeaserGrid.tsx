import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const TeaserGrid: FC<PropsWithChildren> = ({ children }) => (
  <Grid data-kk-teaser-grid container spacing={3} sx={{ display: { xs: 'none', desktop: 'flex' } }}>
    {children}
  </Grid>
);
