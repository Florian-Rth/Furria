import Box from '@mui/material/Box';
import type { FC } from 'react';
import { percentOf } from '../../../internal/score-paint';
import { kkTokens } from '../../../tokens';

interface KkTimelineSnapProps {
  share: number;
}

export const KkTimelineSnap: FC<KkTimelineSnapProps> = ({ share }) => (
  <Box
    aria-hidden
    data-kk-timeline-snap
    style={{ left: percentOf(share) }}
    sx={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 0,
      pointerEvents: 'none',
      borderLeftWidth: kkTokens.line.section,
      borderLeftStyle: 'solid',
      borderLeftColor: 'primary.main',
      boxShadow: (theme) =>
        `0 0 ${kkTokens.line.section * 4}px ${(theme.vars ?? theme).palette.primary.main}`,
    }}
  />
);
