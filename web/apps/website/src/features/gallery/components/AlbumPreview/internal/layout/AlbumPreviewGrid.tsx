import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const AlbumPreviewGrid: FC<PropsWithChildren> = ({ children }) => (
  <Grid container data-kk-album-preview spacing={{ xs: 1.5, md: 2 }}>
    {children}
  </Grid>
);
