import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { frameSlotOf } from '../frame-slot';

export const KkSsFrameTransport: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-ss-slot="transport" sx={frameSlotOf('transport')}>
    {children}
  </Box>
);
