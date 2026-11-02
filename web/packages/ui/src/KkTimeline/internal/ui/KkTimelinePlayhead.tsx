import Box from '@mui/material/Box';
import type { FC } from 'react';
import { percentOf } from '../../../internal/score-paint';
import { kkTokens } from '../../../tokens';
import { LANE_VARS } from '../timeline-paint';

const HEAD = '0.5rem';

interface KkTimelinePlayheadProps {
  share: number;
}

export const KkTimelinePlayhead: FC<KkTimelinePlayheadProps> = ({ share }) => {
  const place = { left: percentOf(Math.min(1, Math.max(0, share))) };

  return (
    <Box
      aria-hidden
      data-kk-timeline-playhead
      style={place}
      sx={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 0,
        pointerEvents: 'none',
        zIndex: 3,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: `max(0px, calc(var(${LANE_VARS.ruler}) - ${HEAD}))`,
          left: `calc(${HEAD} / -2)`,
          width: HEAD,
          height: HEAD,
          bgcolor: 'primary.main',
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: `var(${LANE_VARS.ruler})`,
          bottom: 0,
          left: -kkTokens.line.hair / 2,
          width: kkTokens.line.hair,
          bgcolor: 'primary.main',
        }}
      />
    </Box>
  );
};
