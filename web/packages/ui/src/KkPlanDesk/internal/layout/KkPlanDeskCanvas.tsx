import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkPlanDeskCanvas: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-plan-desk-canvas
    sx={{ gridArea: 'canvas', position: 'relative', minWidth: 0, minHeight: 0 }}
  >
    {children}
  </Box>
);
