import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const ProgramGrid: FC<PropsWithChildren> = ({ children }) => (
  <Grid container spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
    {children}
  </Grid>
);
