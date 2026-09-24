import Box from '@mui/material/Box';
import type { FC } from 'react';
import { SWEEP_VAR, varOf } from '../logic/broom-sweep-vars';
import { BroomSweepBroom } from './BroomSweepBroom';

export const BroomSweepSweeper: FC = () => (
  <Box
    data-kk-broom-sweep-sweeper
    sx={(theme) => ({
      position: 'absolute',
      left: 0,
      top: '50%',
      lineHeight: 0,
      color: 'primary.main',
      transformOrigin: '50% 80%',
      transform: varOf(SWEEP_VAR.sweeper, 'none'),
      opacity: varOf(SWEEP_VAR.sweeperOpacity, '0'),
      filter: `drop-shadow(0 2px 3px color-mix(in srgb, ${(theme.vars ?? theme).palette.primary.main} 35%, transparent))`,
      willChange: 'transform, opacity',
    })}
  >
    <BroomSweepBroom />
  </Box>
);
