import Box from '@mui/material/Box';
import type { FC } from 'react';
import { KkConfettiRain } from '../../../KkConfettiRain';

const PIECE_COUNT = 40;

export const KkMottoStageConfetti: FC = () => (
  <Box
    aria-hidden
    data-kk-motto-stage-confetti
    sx={{
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: -1,
    }}
  >
    <KkConfettiRain count={PIECE_COUNT} />
  </Box>
);
