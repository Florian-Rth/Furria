import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { frameSlotOf } from '../frame-slot';

export const KkSsFrameHead: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-ss-slot="head" sx={frameSlotOf('head')}>
    {children}
  </Box>
);
