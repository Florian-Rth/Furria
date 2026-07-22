import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';

export const HeroPhotoColumn: FC<PropsWithChildren> = ({ children }) => (
  <Grid
    data-kk-hero-photo
    size={{ xs: 12, md: 6 }}
    sx={{
      position: 'relative',
      zIndex: 1,
      pt: 3,
      mx: { md: 'auto' },
    }}
  >
    {children}
  </Grid>
);
