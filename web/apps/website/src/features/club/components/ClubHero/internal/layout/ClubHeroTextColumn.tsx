import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const ClubHeroTextColumn: FC<PropsWithChildren> = ({ children }) => (
  <Grid
    data-kk-club-hero-text
    size={{ xs: 12, md: 7 }}
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 3,
      pt: { md: 6 },
    }}
  >
    {children}
  </Grid>
);
