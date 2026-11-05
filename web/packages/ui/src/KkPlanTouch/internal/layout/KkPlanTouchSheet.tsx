import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkPlanTouchSheet: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-plan-touch-sheet
    sx={{
      gridArea: 'sheet',
      width: '22rem',
      minHeight: 0,
      overflowY: 'auto',
      overscrollBehavior: 'contain',
    }}
  >
    {children}
  </Box>
);
