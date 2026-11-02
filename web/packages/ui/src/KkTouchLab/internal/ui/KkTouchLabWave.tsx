import Box from '@mui/material/Box';
import type { FC } from 'react';
import { touchLabPalette } from '../../touch-lab-paint';

export interface KkTouchLabWaveBar {
  x: number;
  width: number;
  level: number;
  played: boolean;
}

const WAVE_CENTRE_PERCENT = 60;
const WAVE_REACH_PERCENT = 22;
const QUIET_LEVEL = 0.04;

interface KkTouchLabWaveProps {
  bars: readonly KkTouchLabWaveBar[];
}

export const KkTouchLabWave: FC<KkTouchLabWaveProps> = ({ bars }) => (
  <Box
    component="svg"
    aria-hidden
    sx={(theme) => ({
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      '& rect': { fill: touchLabPalette(theme).text.secondary, opacity: 0.5 },
      '& rect[data-played="true"]': { fill: touchLabPalette(theme).primary.main, opacity: 0.9 },
    })}
  >
    {bars.map((bar) => {
      const reach = Math.max(bar.level, QUIET_LEVEL) * WAVE_REACH_PERCENT;

      return (
        <rect
          key={bar.x}
          data-played={bar.played}
          x={bar.x}
          width={bar.width}
          y={`${WAVE_CENTRE_PERCENT - reach}%`}
          height={`${reach * 2}%`}
          rx={bar.width / 2}
        />
      );
    })}
  </Box>
);
