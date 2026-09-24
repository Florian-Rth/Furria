import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const BroomSweepStage: FC<PropsWithChildren> = ({ children }) => (
  <Box
    aria-hidden
    data-kk-broom-sweep-stage
    sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
  >
    {children}
  </Box>
);
