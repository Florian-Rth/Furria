import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import type { FC, PropsWithChildren } from 'react';
import { KkSection } from '../../../KkSection/KkSection';
import { KkHeroConfetti } from '../ui/KkHeroConfetti';

export const KkHeroSectionRoot: FC<PropsWithChildren> = ({ children }) => (
  <KkSection>
    <Box data-kk-hero sx={{ position: 'relative' }}>
      <KkHeroConfetti />
      <Grid
        container
        spacing={{ xs: 5, md: 8 }}
        sx={{ position: 'relative', zIndex: 1, alignItems: 'flex-start' }}
      >
        {children}
      </Grid>
    </Box>
  </KkSection>
);
