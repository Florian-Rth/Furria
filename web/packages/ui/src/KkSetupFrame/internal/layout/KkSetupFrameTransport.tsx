import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { frameSlotOf } from '../frame-slot';

export const KkSetupFrameTransport: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-setup-slot="transport" sx={frameSlotOf('transport')}>
    {children}
  </Box>
);
