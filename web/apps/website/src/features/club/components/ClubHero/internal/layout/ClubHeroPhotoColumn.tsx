import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const ClubHeroPhotoColumn: FC<PropsWithChildren> = ({ children }) => (
  <Grid
    data-kk-club-hero-photo
    size={{ xs: 12, md: 5 }}
    sx={{
      display: { xs: 'none', md: 'block' },
      position: 'relative',
      zIndex: 1,
      pt: { md: 4 },
    }}
  >
    {children}
  </Grid>
);
