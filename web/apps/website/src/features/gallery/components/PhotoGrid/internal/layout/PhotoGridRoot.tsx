import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const PhotoGridRoot: FC<PropsWithChildren> = ({ children }) => (
  <Grid data-kk-photo-grid container spacing={{ xs: 1.5, md: 2 }}>
    {children}
  </Grid>
);
