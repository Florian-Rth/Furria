import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export type KkTimelineHalfSide = 'before' | 'after';

const CLIPS: Record<KkTimelineHalfSide, string> = {
  before: 'inset(0 50% 0 0)',
  after: 'inset(0 0 0 50%)',
};

interface KkTimelineHalfProps extends PropsWithChildren {
  side: KkTimelineHalfSide;
}

export const KkTimelineHalf: FC<KkTimelineHalfProps> = ({ side, children }) => (
  <Box
    aria-hidden
    data-kk-timeline-half={side}
    style={{ clipPath: CLIPS[side] }}
    sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
  >
    {children}
  </Box>
);
