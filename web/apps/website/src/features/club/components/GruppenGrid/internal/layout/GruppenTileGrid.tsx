import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

const MIN_TILE_WIDTH = '15rem';

export const GruppenTileGrid: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-gruppen-grid
    sx={{
      display: 'grid',
      gap: { xs: 2, md: 3 },
      gridTemplateColumns: `repeat(auto-fill, minmax(${MIN_TILE_WIDTH}, 1fr))`,
    }}
  >
    {children}
  </Box>
);
