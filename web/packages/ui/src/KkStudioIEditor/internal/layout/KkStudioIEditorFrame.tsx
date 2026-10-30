import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioIEditorFrame: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-studio-i-frame-slot
    sx={{ gridArea: 'frame', display: 'grid', minWidth: 0, minHeight: 0, position: 'relative' }}
  >
    {children}
  </Box>
);
