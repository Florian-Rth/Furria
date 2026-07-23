import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';
import { ClubHeroConfetti } from '../ui/ClubHeroConfetti';
import { ClubHeroNumeral } from '../ui/ClubHeroNumeral';
import { ClubHeroRibbon } from '../ui/ClubHeroRibbon';

export const ClubHeroRoot: FC<PropsWithChildren> = ({ children }) => (
  <Box component="section" data-kk-club-hero sx={{ position: 'relative' }}>
    <ClubHeroNumeral />
    <ClubHeroConfetti />
    <ClubHeroRibbon />
    <Grid
      container
      spacing={{ xs: 5, md: 8 }}
      sx={{ position: 'relative', zIndex: 1, alignItems: 'flex-start' }}
    >
      {children}
    </Grid>
  </Box>
);
