import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export type KkStageFloatSide = 'above' | 'below';

const PERCENT = 100;
const FLOAT_LAYER = 6;
const GAP = '1.75rem';

const transformOf = (x: number, y: number, side: KkStageFloatSide): string => {
  const lift = side === 'above' ? `calc(-100% - ${GAP})` : GAP;
  const across = Math.min(1, Math.max(0, x)) * PERCENT;

  return `translate3d(calc(${across}cqw - ${across}%), calc(${y * PERCENT}cqh + ${lift}), 0)`;
};

interface KkStageFloatProps extends PropsWithChildren {
  x: number;
  y: number;
  side: KkStageFloatSide;
}

export const KkStageFloat: FC<KkStageFloatProps> = ({ x, y, side, children }) => (
  <Box
    data-kk-stage-float
    style={{ transform: transformOf(x, y, side) }}
    sx={{
      position: 'absolute',
      left: 0,
      top: 0,
      zIndex: FLOAT_LAYER,
      maxWidth: '100cqw',
      pointerEvents: 'auto',
    }}
  >
    {children}
  </Box>
);
