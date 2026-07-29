import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const PhotoViewerStage: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-photo-viewer-stage
    sx={{
      gridArea: 'stage',
      display: 'grid',
      placeItems: 'center',
      minHeight: 0,
      minWidth: 0,
    }}
  >
    {children}
  </Box>
);
