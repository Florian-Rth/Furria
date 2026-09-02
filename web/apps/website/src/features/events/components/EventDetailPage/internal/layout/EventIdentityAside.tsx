import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const EventIdentityAside: FC<PropsWithChildren> = ({ children }) => (
  <Grid
    size={{ xs: 12, desktop: 5 }}
    sx={{ display: { xs: 'none', desktop: 'block' }, minWidth: 0 }}
  >
    {children}
  </Grid>
);
