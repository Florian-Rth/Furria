import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { frameSlotOf } from '../frame-slot';

export const KkSetupFrameTimeline: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-setup-slot="timeline" sx={frameSlotOf('timeline')}>
    {children}
  </Box>
);
