import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const ClubStoryLayout: FC<PropsWithChildren> = ({ children }) => (
  <Grid container spacing={{ xs: 4, md: 7 }} sx={{ alignItems: 'center' }}>
    {children}
  </Grid>
);
