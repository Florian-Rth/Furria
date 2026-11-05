import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

const GHOST_OPACITY = 0.55;

export const KkFloorPlanGhost: FC<PropsWithChildren> = ({ children }) => (
  <Box
    component="g"
    aria-hidden
    data-kk-plan-ghost
    sx={{ opacity: GHOST_OPACITY, pointerEvents: 'none' }}
  >
    {children}
  </Box>
);
