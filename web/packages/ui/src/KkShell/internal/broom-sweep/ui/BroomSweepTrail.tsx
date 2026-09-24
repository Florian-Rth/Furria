import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { SWEEP_VAR, varOf } from '../logic/broom-sweep-vars';

const ANGLE = varOf(SWEEP_VAR.trailAngle, '90deg');

const inkOf = (theme: Theme, amount: string): string =>
  `color-mix(in srgb, ${(theme.vars ?? theme).palette.primary.main} ${amount}, transparent)`;

const streakOf = (theme: Theme): string =>
  `repeating-linear-gradient(0deg, transparent 0 3px, ${inkOf(theme, '18%')} 3px 4px)`;

const tintOf = (theme: Theme): string =>
  `linear-gradient(${ANGLE}, transparent 0%, ${inkOf(theme, '7%')} 70%, ${inkOf(theme, '18%')} 100%)`;

export const BroomSweepTrail: FC = () => (
  <Box
    data-kk-broom-sweep-trail
    sx={(theme) => ({
      position: 'absolute',
      top: '50%',
      height: '62%',
      left: varOf(SWEEP_VAR.trailLeft, '0px'),
      width: varOf(SWEEP_VAR.trailWidth, '0px'),
      transform: 'translateY(-50%)',
      opacity: varOf(SWEEP_VAR.trailOpacity, '0'),
      borderRadius: 1,
      backgroundImage: `${streakOf(theme)}, ${tintOf(theme)}`,
      maskImage: `linear-gradient(${ANGLE}, transparent 0%, black 55%)`,
    })}
  />
);
