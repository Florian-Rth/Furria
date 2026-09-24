import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkGroupStageMedia: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-group-stage-media
    sx={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      zIndex: 0,
      pointerEvents: 'none',
    }}
  >
    {children}
  </Box>
);
