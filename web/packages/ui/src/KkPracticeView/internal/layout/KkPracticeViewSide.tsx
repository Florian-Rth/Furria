import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkPracticeViewSide: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-practice-side
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
