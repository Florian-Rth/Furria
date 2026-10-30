import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

const PERCENT = 100;
const EDGE = '0.75rem';
const RADIUS = `${kkTokens.radius.base * 0.75}px`;

const veil = (theme: Theme): string =>
  `color-mix(in srgb, ${(theme.vars ?? theme).palette.background.default} 60%, transparent)`;

interface KkStudioIWaveShadeProps {
  from: number;
  to: number;
}

export const KkStudioIWaveShade: FC<KkStudioIWaveShadeProps> = ({ from, to }) => (
  <Box aria-hidden sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
    <Box
      style={{ width: `calc(${from * PERCENT}% + ${EDGE})` }}
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: `-${EDGE}`,
        borderRadius: `${RADIUS} 0 0 ${RADIUS}`,
        backgroundColor: veil(theme),
      })}
    />
    <Box
      style={{ width: `calc(${(1 - to) * PERCENT}% + ${EDGE})` }}
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: `-${EDGE}`,
        borderRadius: `0 ${RADIUS} ${RADIUS} 0`,
        backgroundColor: veil(theme),
      })}
    />
  </Box>
);
