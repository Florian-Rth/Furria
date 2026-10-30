import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export type KkLaneDeskAreaName = 'band' | 'bar' | 'stage' | 'inspector' | 'overview' | 'lanes';

interface KkLaneDeskAreaProps extends PropsWithChildren {
  area: KkLaneDeskAreaName;
}

export const KkLaneDeskArea: FC<KkLaneDeskAreaProps> = ({ area, children }) => (
  <Box
    data-kk-lane-desk-area={area}
    sx={{
      gridArea: area,
      minWidth: 0,
      minHeight: 0,
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'minmax(0, 1fr)',
    }}
  >
    {children}
  </Box>
);
