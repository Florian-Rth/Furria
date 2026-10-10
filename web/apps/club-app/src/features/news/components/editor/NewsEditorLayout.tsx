import Grid from '@mui/material/Grid';
import type { FC, ReactNode } from 'react';

interface NewsEditorLayoutProps {
  main: ReactNode;
  aside: ReactNode;
}

export const NewsEditorLayout: FC<NewsEditorLayoutProps> = ({ main, aside }) => (
  <Grid container spacing={{ xs: 2, lg: 4 }} sx={{ alignItems: 'flex-start', pb: 2 }}>
    <Grid size={{ xs: 12, lg: 8 }} sx={{ minWidth: 0, pl: { md: 7, lg: 7 } }}>
      {main}
    </Grid>
    <Grid
      size={{ xs: 12, lg: 4 }}
      sx={{ display: { xs: 'none', lg: 'block' }, position: 'sticky', top: 80, minWidth: 0 }}
    >
      {aside}
    </Grid>
  </Grid>
);
