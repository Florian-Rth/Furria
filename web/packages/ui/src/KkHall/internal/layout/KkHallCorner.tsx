import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export type KkHallCornerSide = 'start' | 'end';

interface KkHallCornerProps extends PropsWithChildren {
  side: KkHallCornerSide;
}

export const KkHallCorner: FC<KkHallCornerProps> = ({ side, children }) => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: side === 'start' ? 0 : 'auto',
      right: side === 'end' ? 0 : 'auto',
      zIndex: 3,
    }}
  >
    {children}
  </Box>
);
