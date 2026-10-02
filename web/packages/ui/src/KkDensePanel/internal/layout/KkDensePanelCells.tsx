import Box from '@mui/material/Box';
import type { CSSObject } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { DENSE_CELLS_CONTAINER, DENSE_CELLS_TWO_UP } from '../dense-panel-paint';

const CELLS_CONTAINER: CSSObject = {
  minWidth: 0,
  containerType: 'inline-size',
  containerName: DENSE_CELLS_CONTAINER,
};

const CELLS_GRID: CSSObject = {
  m: 0,
  p: 0,
  listStyle: 'none',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  [DENSE_CELLS_TWO_UP]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
};

export const KkDensePanelCells: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-dense-cells sx={CELLS_CONTAINER}>
    <Box component="ul" sx={CELLS_GRID}>
      {children}
    </Box>
  </Box>
);
