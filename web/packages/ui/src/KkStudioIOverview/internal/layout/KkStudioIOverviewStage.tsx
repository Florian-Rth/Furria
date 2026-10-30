import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioIOverviewStage: FC<PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      position: 'relative',
      width: '100%',
      height: '9rem',
      display: 'grid',
      placeItems: 'center',
      containerType: 'size',
    }}
  >
    {children}
  </Box>
);
