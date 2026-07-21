import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { HeroWatermark } from './internal/HeroWatermark';

const HeroLayoutRoot: FC<PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      position: 'relative',
      overflow: 'hidden',
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: '1.06fr 0.94fr' },
      gap: { xs: 6, md: 8 },
      alignItems: 'center',
      width: '100%',
    }}
  >
    <HeroWatermark />
    {children}
  </Box>
);

const TextColumn: FC<PropsWithChildren> = ({ children }) => (
  <Stack data-kk-hero-text sx={{ position: 'relative', zIndex: 1, alignItems: 'flex-start' }}>
    {children}
  </Stack>
);

const PhotoColumn: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-hero-photo sx={{ position: 'relative', zIndex: 1 }}>
    {children}
  </Box>
);

export const HeroLayout = Object.assign(HeroLayoutRoot, { TextColumn, PhotoColumn });
