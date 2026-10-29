import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioEViewSide: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-studio-e-side
    sx={{
      gridArea: 'side',
      display: 'grid',
      minWidth: 0,
      minHeight: 0,
      containerType: 'size',
    }}
  >
    {children}
  </Box>
);
