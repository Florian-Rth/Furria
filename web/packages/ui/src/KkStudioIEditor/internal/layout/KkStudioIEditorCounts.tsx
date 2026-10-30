import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioIEditorCounts: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-studio-i-counts-slot sx={{ gridArea: 'counts', display: 'grid', minWidth: 0 }}>
    {children}
  </Box>
);
