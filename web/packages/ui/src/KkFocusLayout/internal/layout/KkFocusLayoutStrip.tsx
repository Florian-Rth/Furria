import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkFocusLayoutStrip: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-focus-strip sx={{ gridArea: 'strip', minWidth: 0, minHeight: 0 }}>
    {children}
  </Box>
);
