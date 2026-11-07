import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { frameSlotOf } from '../frame-slot';

export const KkSetupFrameHead: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-setup-slot="head" sx={frameSlotOf('head')}>
    {children}
  </Box>
);
