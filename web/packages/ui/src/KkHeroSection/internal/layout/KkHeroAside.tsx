import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const KkHeroAside: FC<PropsWithChildren> = ({ children }) => (
  <Grid
    data-kk-hero-aside
    size={{ xs: 12, md: 5 }}
    sx={{
      position: { xs: 'absolute', md: 'relative' },
      inset: { xs: 0, md: 'auto' },
      zIndex: { xs: 0, md: 'auto' },
      minWidth: 0,
    }}
  >
    {children}
  </Grid>
);
