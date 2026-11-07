import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { frameSlotOf } from '../frame-slot';

export const KkSsFrameFoot: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-ss-slot="foot" sx={frameSlotOf('foot')}>
    {children}
  </Box>
);
