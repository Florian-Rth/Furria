import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkPlanDeskInspector: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-plan-desk-inspector
    sx={(theme) => ({
      display: 'none',
      [theme.breakpoints.up('desktop')]: {
        display: 'block',
        gridArea: 'inspector',
        minWidth: 0,
        minHeight: 0,
        overflowY: 'auto',
        overscrollBehavior: 'contain',
      },
    })}
  >
    {children}
  </Box>
);
