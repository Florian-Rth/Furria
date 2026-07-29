import Box from '@mui/material/Box';
import type { FC } from 'react';
import { KkConfettiRain } from '../../../KkConfettiRain';

export const KkHeroConfetti: FC = () => (
  <Box data-kk-hero-confetti aria-hidden sx={{ position: 'absolute', inset: 0, zIndex: 0 }}>
    <KkConfettiRain fadeOut />
  </Box>
);
