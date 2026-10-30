import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioIEditorWave: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-studio-i-wave-slot sx={{ gridArea: 'wave', display: 'grid', minWidth: 0 }}>
    {children}
  </Box>
);
