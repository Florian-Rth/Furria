import Box from '@mui/material/Box';
import type { FC } from 'react';
import { inkWash } from '../../../internal/ink-wash';
import { percentOf } from '../../../internal/score-paint';
import { waveBottom, waveTop } from '../timeline-paint';

interface KkTimelineCountsProps {
  shares: readonly number[];
}

export const KkTimelineCounts: FC<KkTimelineCountsProps> = ({ shares }) => {
  const lines = shares.map((share) => (
    <Box
      key={share}
      component="span"
      style={{ left: percentOf(share) }}
      sx={(theme) => ({
        position: 'absolute',
        top: 0,
        bottom: 0,
        borderLeft: `1px solid ${inkWash(theme, '7%')}`,
      })}
    />
  ));

  return (
    <Box
      aria-hidden
      data-kk-timeline-counts
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: waveTop,
        bottom: waveBottom,
        pointerEvents: 'none',
      }}
    >
      {lines}
    </Box>
  );
};
