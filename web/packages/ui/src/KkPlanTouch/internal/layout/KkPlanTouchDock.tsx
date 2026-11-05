import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkPlanTouchDock: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-plan-touch-dock
    sx={{ gridArea: 'dock', minWidth: 0, pb: 'env(safe-area-inset-bottom)' }}
  >
    {children}
  </Box>
);
