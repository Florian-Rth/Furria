import Box from '@mui/material/Box';
import type { FC } from 'react';
import { WAVE_VIEW_HEIGHT, wavePathOf } from '../wave-path';

export type KkStudioAStripWaveTone = 'rest' | 'played';

interface KkStudioAStripWaveProps {
  values: readonly number[];
  tone: KkStudioAStripWaveTone;
}

export const KkStudioAStripWave: FC<KkStudioAStripWaveProps> = ({ values, tone }) => (
  <Box
    component="svg"
    aria-hidden
    data-kk-studio-a-wave={tone}
    viewBox={`0 0 ${Math.max(1, values.length)} ${WAVE_VIEW_HEIGHT}`}
    preserveAspectRatio="none"
    sx={(theme) => ({
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      fill:
        tone === 'played'
          ? (theme.vars ?? theme).palette.text.primary
          : (theme.vars ?? theme).palette.text.disabled,
      opacity: tone === 'played' ? 1 : 0.55,
    })}
  >
    <path d={wavePathOf(values)} />
  </Box>
);
