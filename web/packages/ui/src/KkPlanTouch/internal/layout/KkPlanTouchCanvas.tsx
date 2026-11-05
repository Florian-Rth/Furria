import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkPlanTouchCanvas: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-plan-touch-canvas
    sx={{ gridArea: 'canvas', position: 'relative', minWidth: 0, minHeight: 0 }}
  >
    {children}
  </Box>
);
