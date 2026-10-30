import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioIOverviewSpots: FC<PropsWithChildren> = ({ children }) => (
  <Box
    component="ul"
    sx={{
      m: 0,
      p: 0,
      listStyle: 'none',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(7.5rem, 1fr))',
      gap: 0.5,
    }}
  >
    {children}
  </Box>
);
