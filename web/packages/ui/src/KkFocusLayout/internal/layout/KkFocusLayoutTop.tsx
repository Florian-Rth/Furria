import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkFocusLayoutTop: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-focus-top sx={{ gridArea: 'top', minWidth: 0 }}>
    {children}
  </Box>
);
