import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const HeroTextColumn: FC<PropsWithChildren> = ({ children }) => (
  <Grid
    data-kk-hero-text
    size={{ xs: 12, md: 6 }}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 3,
    }}
  >
    {children}
  </Grid>
);
