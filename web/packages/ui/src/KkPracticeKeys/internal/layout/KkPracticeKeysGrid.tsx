import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkPracticeKeysGrid: FC<PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: 1,
      minWidth: 0,
    }}
  >
    {children}
  </Box>
);
