import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const AlbumGrid: FC<PropsWithChildren> = ({ children }) => (
  <Grid data-kk-album-grid container spacing={{ xs: 2, md: 2.5 }}>
    {children}
  </Grid>
);
