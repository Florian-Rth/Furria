import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { frameSlotOf } from '../frame-slot';

export const KkSsFrameTimeline: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-ss-slot="timeline" sx={frameSlotOf('timeline')}>
    {children}
  </Box>
);
