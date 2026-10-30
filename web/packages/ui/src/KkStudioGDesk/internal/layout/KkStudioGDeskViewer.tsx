import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { arrivalOf } from './kk-studio-g-arrival';

export const KkStudioGDeskViewer: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-studio-g-viewer
    sx={{
      gridArea: 'viewer',
      display: 'grid',
      minWidth: 0,
      minHeight: 0,
      ...arrivalOf('settle', 0),
    }}
  >
    {children}
  </Box>
);
