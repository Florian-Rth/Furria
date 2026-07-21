import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';
import { HeroWatermark } from '../ui/HeroWatermark';

export const HeroRoot: FC<PropsWithChildren> = ({ children }) => (
  <Grid container spacing={{ xs: 6, md: 8 }} sx={{ position: 'relative', alignItems: 'center' }}>
    <HeroWatermark />
    {children}
  </Grid>
);
