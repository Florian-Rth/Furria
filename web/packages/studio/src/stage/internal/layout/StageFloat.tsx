import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export type StageFloatSide = 'above' | 'below';

const PERCENT = 100;
const FLOAT_LAYER = 6;
const GAP = '1.75rem';

interface StageFloatProps extends PropsWithChildren {
  x: number;
  y: number;
  side: StageFloatSide;
}

export const StageFloat: FC<StageFloatProps> = ({ x, y, side, children }) => {
  const lift = side === 'above' ? `calc(-100% - ${GAP})` : GAP;

  return (
    <Box
      style={{
        transform: `translate3d(calc(${x * PERCENT}cqw - 50%), calc(${y * PERCENT}cqh + ${lift}), 0)`,
      }}
      sx={{ position: 'absolute', left: 0, top: 0, zIndex: FLOAT_LAYER, pointerEvents: 'auto' }}
    >
      {children}
    </Box>
  );
};
