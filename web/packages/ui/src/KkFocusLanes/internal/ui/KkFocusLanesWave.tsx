import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { WAVE_HEIGHT, wavePathOf } from '../wave-path';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusLanesWaveProps {
  bars: readonly number[];
  inset?: string;
}

export const KkFocusLanesWave: FC<KkFocusLanesWaveProps> = ({ bars, inset = '0.375rem' }) => (
  <Box
    component="svg"
    aria-hidden
    viewBox={`0 0 ${Math.max(1, bars.length)} ${WAVE_HEIGHT}`}
    preserveAspectRatio="none"
    sx={(theme) => ({
      position: 'absolute',
      left: 0,
      width: '100%',
      top: inset,
      height: `calc(100% - 2 * ${inset})`,
      pointerEvents: 'none',
      fill: `color-mix(in srgb, ${palette(theme).text.primary} 28%, transparent)`,
    })}
  >
    <path d={wavePathOf(bars)} />
  </Box>
);
