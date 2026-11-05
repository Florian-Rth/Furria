import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkPlanTouchTop: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-plan-touch-top sx={{ gridArea: 'top', minWidth: 0 }}>
    {children}
  </Box>
);
