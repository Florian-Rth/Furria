import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export type KkPlanFloatPlacement = 'above' | 'below';

interface KkPlanTouchFloatProps extends PropsWithChildren {
  x: number;
  y: number;
  placement: KkPlanFloatPlacement;
}

const SHIFT: Record<KkPlanFloatPlacement, string> = {
  above: 'translate(-50%, -100%)',
  below: 'translate(-50%, 0)',
};

export const KkPlanTouchFloat: FC<KkPlanTouchFloatProps> = ({ x, y, placement, children }) => (
  <Box
    data-kk-plan-touch-float={placement}
    sx={{
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      transform: SHIFT[placement],
      zIndex: 2,
      width: 'max-content',
      maxWidth: 'calc(100% - 16px)',
    }}
  >
    {children}
  </Box>
);
