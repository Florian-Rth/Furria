import Box from '@mui/material/Box';
import type { FC } from 'react';
import { percentOf } from '../../../internal/score-paint';
import { kkTokens } from '../../../tokens';
import { LANE_VARS, waveTop } from '../timeline-paint';

interface KkTimelineCutsProps {
  shares: readonly number[];
}

export const KkTimelineCuts: FC<KkTimelineCutsProps> = ({ shares }) => {
  const cuts = shares.map((share) => (
    <Box
      key={share}
      component="span"
      data-kk-timeline-cut
      style={{ left: percentOf(share) }}
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        borderLeftWidth: kkTokens.line.hair,
        borderLeftStyle: 'dashed',
        borderLeftColor: 'text.disabled',
      }}
    />
  ));

  return (
    <Box
      aria-hidden
      data-kk-timeline-cuts
      sx={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: waveTop,
        bottom: `var(${LANE_VARS.steps})`,
        pointerEvents: 'none',
      }}
    >
      {cuts}
    </Box>
  );
};
