import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const EventIdentityMain: FC<PropsWithChildren> = ({ children }) => (
  <Grid
    size={{ xs: 12, desktop: 7 }}
    sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 }, minWidth: 0 }}
  >
    {children}
  </Grid>
);
