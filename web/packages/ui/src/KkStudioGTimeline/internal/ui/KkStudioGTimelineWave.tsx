import Box from '@mui/material/Box';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { wavePathOf } from '../logic/wave-path';

interface KkStudioGTimelineWaveProps {
  values: readonly number[];
  cuts: readonly number[];
  lengthSeconds: number;
}

export const KkStudioGTimelineWave: FC<KkStudioGTimelineWaveProps> = ({
  values,
  cuts,
  lengthSeconds,
}) => {
  const length = Math.max(lengthSeconds, 1);
  const cutPath = cuts.map((cut) => `M${cut} 0V1`).join('');

  return (
    <Box
      component="svg"
      aria-hidden
      viewBox={`0 0 ${length} 1`}
      preserveAspectRatio="none"
      data-kk-studio-g-wave
      sx={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <Box
        component="path"
        d={wavePathOf(values, length)}
        sx={{ fill: 'currentColor', color: 'text.secondary', opacity: 0.5 }}
      />
      <Box
        component="path"
        d={cutPath}
        vectorEffect="non-scaling-stroke"
        sx={{
          fill: 'none',
          stroke: 'currentColor',
          color: 'text.primary',
          strokeWidth: kkTokens.line.section,
        }}
      />
    </Box>
  );
};
