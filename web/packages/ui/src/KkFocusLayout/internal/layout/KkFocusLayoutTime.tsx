import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkFocusLayoutTime: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-focus-time
    sx={{
      gridArea: 'time',
      minWidth: 0,
      maxHeight: '55cqh',
      overflowY: 'auto',
      overscrollBehavior: 'contain',
    }}
  >
    {children}
  </Box>
);
