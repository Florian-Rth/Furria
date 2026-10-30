import Box from '@mui/material/Box';
import type { FC } from 'react';

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 100;

export interface KkStudioWaveBeat {
  share: number;
}

const pathOf = (beats: readonly KkStudioWaveBeat[]): string =>
  beats.map((beat) => `M${(beat.share * VIEW_WIDTH).toFixed(2)} 0V${VIEW_HEIGHT}`).join('');

interface KkStudioWaveBeatsProps {
  beats: readonly KkStudioWaveBeat[];
}

export const KkStudioWaveBeats: FC<KkStudioWaveBeatsProps> = ({ beats }) => (
  <Box
    component="svg"
    aria-hidden
    data-kk-studio-beats
    viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
    preserveAspectRatio="none"
    sx={(theme) => ({
      position: 'absolute',
      left: 0,
      top: '2.75rem',
      width: '100%',
      height: 'calc(100% - 4.75rem)',
      fill: 'none',
      stroke: (theme.vars ?? theme).palette.primary.main,
      opacity: 0.4,
      pointerEvents: 'none',
      '& path': { vectorEffect: 'non-scaling-stroke', strokeWidth: 1 },
    })}
  >
    <path d={pathOf(beats)} />
  </Box>
);
