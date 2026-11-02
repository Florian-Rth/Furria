import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioListPlaces: FC<PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      flexShrink: 0,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(6.5rem, 1fr))',
      gap: 0.5,
      px: 0.5,
    }}
  >
    {children}
  </Box>
);
