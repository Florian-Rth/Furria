import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkFocusLanesView: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-focus-view
    sx={{ position: 'relative', minWidth: 0, overflow: 'clip', containerType: 'inline-size' }}
  >
    {children}
  </Box>
);
