import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export type KkEjDeskAreaName = 'band' | 'bar' | 'stage' | 'pane' | 'overview' | 'lanes';

interface KkEjDeskAreaProps extends PropsWithChildren {
  area: KkEjDeskAreaName;
}

export const KkEjDeskArea: FC<KkEjDeskAreaProps> = ({ area, children }) => (
  <Box
    data-kk-ej-desk-area={area}
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
