import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const PeopleGrid: FC<PropsWithChildren> = ({ children }) => (
  <Grid data-kk-people-grid container spacing={{ xs: 2, md: 3 }} sx={{ alignItems: 'flex-start' }}>
    {children}
  </Grid>
);
