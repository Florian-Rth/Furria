import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const PhotoStackFan: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-photo-stack-fan
    sx={{ position: 'absolute', inset: 0, display: { xs: 'none', desktop: 'block' } }}
  >
    {children}
  </Box>
);
