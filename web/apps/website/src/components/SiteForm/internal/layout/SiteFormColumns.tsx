import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const SiteFormColumns: FC<PropsWithChildren> = ({ children }) => (
  <Grid
    container
    data-kk-site-form-columns
    spacing={{ xs: 4, desktop: 6 }}
    sx={{ alignItems: 'flex-start' }}
  >
    {children}
  </Grid>
);
