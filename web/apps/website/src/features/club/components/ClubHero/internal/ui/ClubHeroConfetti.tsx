import { KkConfettiScatter } from '@furria/ui';
import Box from '@mui/material/Box';
import type { FC } from 'react';

export const ClubHeroConfetti: FC = () => (
  <Box
    data-kk-club-confetti
    aria-hidden
    sx={{ display: { xs: 'none', md: 'block' }, position: 'absolute', inset: 0, zIndex: 0 }}
  >
    <KkConfettiScatter count={7} seed={11} />
  </Box>
);
