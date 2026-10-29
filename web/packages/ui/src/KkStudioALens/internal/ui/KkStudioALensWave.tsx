import Box from '@mui/material/Box';
import type { FC } from 'react';
import { WAVE_VIEW_HEIGHT, wavePathOf } from '../../../KkStudioAStrip/internal/wave-path';

interface KkStudioALensWaveProps {
  values: readonly number[];
}

export const KkStudioALensWave: FC<KkStudioALensWaveProps> = ({ values }) => (
  <Box
    component="svg"
    viewBox={`0 0 ${Math.max(1, values.length)} ${WAVE_VIEW_HEIGHT}`}
    preserveAspectRatio="none"
    sx={(theme) => ({
      position: 'absolute',
      left: 0,
      right: 0,
      top: '18%',
      height: '64%',
      width: '100%',
      fill: (theme.vars ?? theme).palette.text.disabled,
      opacity: 0.32,
    })}
  >
    <path d={wavePathOf(values)} />
  </Box>
);
