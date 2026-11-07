import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { frameSlotOf } from '../frame-slot';

export const KkSsFramePicture: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-ss-slot="picture" sx={frameSlotOf('picture')}>
    {children}
  </Box>
);
