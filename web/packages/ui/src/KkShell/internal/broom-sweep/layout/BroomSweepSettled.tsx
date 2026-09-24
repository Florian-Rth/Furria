import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const BroomSweepSettled: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-broom-sweep-settled sx={{ display: 'contents' }}>
    {children}
  </Box>
);
