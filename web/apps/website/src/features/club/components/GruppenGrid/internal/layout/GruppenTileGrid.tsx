import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const GruppenTileGrid: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-gruppen-grid
    sx={{
      display: 'grid',
      gap: { xs: 2, md: 3 },
      gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
    }}
  >
    {children}
  </Box>
);
