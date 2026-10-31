import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkLanePhoneSplit: FC<PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      minHeight: 0,
      minWidth: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'clamp(7rem, 24%, 12rem) minmax(0, 1fr)',
      gap: 1,
    }}
  >
    {children}
  </Box>
);
