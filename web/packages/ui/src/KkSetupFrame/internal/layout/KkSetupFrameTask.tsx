import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { frameSlotOf } from '../frame-slot';

export const KkSetupFrameTask: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-setup-slot="task" sx={frameSlotOf('task')}>
    {children}
  </Box>
);
