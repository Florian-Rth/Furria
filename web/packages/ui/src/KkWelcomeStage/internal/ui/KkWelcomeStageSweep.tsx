import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import type { FC } from 'react';
import { REDUCED_MOTION } from '../welcome-paint';

export const KK_WELCOME_SWEEP_MS = 720;

const BAND_HEIGHT = '34dvh';

const sweep = keyframes`
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(100dvh);
  }
`;

interface KkWelcomeStageSweepProps {
  at: number;
}

export const KkWelcomeStageSweep: FC<KkWelcomeStageSweepProps> = ({ at }) => (
  <Box
    aria-hidden
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: BAND_HEIGHT,
      zIndex: 2,
      pointerEvents: 'none',
      bgcolor: 'primary.main',
      transform: 'translateY(-100%)',
      animation: `${sweep} ${KK_WELCOME_SWEEP_MS}ms cubic-bezier(0.7, 0, 0.3, 1) ${at}ms both`,
      [REDUCED_MOTION]: { display: 'none' },
    }}
  />
);
