import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const EventIdentityLayout: FC<PropsWithChildren> = ({ children }) => (
  <Grid
    container
    data-kk-event-identity
    spacing={{ xs: 4, md: 6 }}
    sx={{ alignItems: 'flex-start' }}
  >
    {children}
  </Grid>
);
