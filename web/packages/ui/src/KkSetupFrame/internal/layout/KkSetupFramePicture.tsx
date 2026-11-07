import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { frameSlotOf } from '../frame-slot';

export const KkSetupFramePicture: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-setup-slot="picture" sx={frameSlotOf('picture')}>
    {children}
  </Box>
);
