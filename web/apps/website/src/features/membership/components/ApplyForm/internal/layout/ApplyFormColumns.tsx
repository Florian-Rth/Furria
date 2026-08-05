import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const ApplyFormColumns: FC<PropsWithChildren> = ({ children }) => (
  <Grid
    container
    data-kk-apply-columns
    spacing={{ xs: 4, desktop: 6 }}
    sx={{ alignItems: 'flex-start' }}
  >
    {children}
  </Grid>
);
