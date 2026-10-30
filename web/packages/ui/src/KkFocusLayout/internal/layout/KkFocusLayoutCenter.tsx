import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkFocusLayoutCenter: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-focus-center
    sx={{
      position: 'absolute',
      inset: 0,
      display: 'grid',
      placeItems: 'center',
      pointerEvents: 'none',
      zIndex: 3,
      '& > *': { pointerEvents: 'auto' },
    }}
  >
    {children}
  </Box>
);
