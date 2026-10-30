import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkWayStageCorner: FC<PropsWithChildren> = ({ children }) => (
  <Box sx={{ position: 'absolute', left: 0, top: 0, zIndex: 4, transform: 'translateY(-100%)' }}>
    {children}
  </Box>
);
