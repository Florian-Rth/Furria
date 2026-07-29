import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const KkHeroMain: FC<PropsWithChildren> = ({ children }) => (
  <Grid
    data-kk-hero-main
    size={{ xs: 12, md: 7 }}
    sx={{
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 2, md: 3 },
    }}
  >
    {children}
  </Grid>
);
