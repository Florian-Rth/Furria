import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const AlbumGridItem: FC<PropsWithChildren> = ({ children }) => (
  <Grid data-kk-album-grid-item size={{ xs: 12, sm: 6, md: 4 }}>
    {children}
  </Grid>
);
