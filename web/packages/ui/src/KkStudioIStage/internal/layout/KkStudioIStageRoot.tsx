import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioIStageRoot: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-studio-i-stage sx={{ position: 'absolute', inset: 0 }}>
    {children}
  </Box>
);
