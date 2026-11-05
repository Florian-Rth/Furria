import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkPlanDeskRail: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-plan-desk-rail
    sx={(theme) => ({
      gridArea: 'rail',
      minWidth: 0,
      minHeight: 0,
      [theme.breakpoints.up('desktop')]: { overflowY: 'auto' },
    })}
  >
    {children}
  </Box>
);
