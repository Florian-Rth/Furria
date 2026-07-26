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
      alignItems: 'flex-start',
      gap: { xs: 2, md: 3 },
      minWidth: 0,
    }}
  >
    {children}
  </Grid>
);
