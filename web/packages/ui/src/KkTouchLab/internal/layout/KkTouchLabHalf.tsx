import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export type KkTouchLabHalfSide = 'before' | 'after';

const CLIPS: Record<KkTouchLabHalfSide, string> = {
  before: 'inset(0 50% 0 0)',
  after: 'inset(0 0 0 50%)',
};

interface KkTouchLabHalfProps extends PropsWithChildren {
  side: KkTouchLabHalfSide;
}

export const KkTouchLabHalf: FC<KkTouchLabHalfProps> = ({ side, children }) => (
  <Box
    aria-hidden
    style={{ clipPath: CLIPS[side] }}
    sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
  >
    {children}
  </Box>
);
