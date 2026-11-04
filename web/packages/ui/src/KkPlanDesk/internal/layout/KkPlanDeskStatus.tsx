import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkPlanDeskStatus: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-plan-desk-status sx={{ gridArea: 'status', minWidth: 0 }}>
    {children}
  </Box>
);
