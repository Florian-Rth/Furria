import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const SeasonRow: FC<PropsWithChildren> = ({ children }) => (
  <Grid data-kk-season-row container spacing={{ xs: 2, md: 3 }} sx={{ alignItems: 'stretch' }}>
    {children}
  </Grid>
);
