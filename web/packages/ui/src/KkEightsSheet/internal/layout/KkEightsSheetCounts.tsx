import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { SHEET_COLUMNS } from '../logic/sheet-metrics';

export const KkEightsSheetCounts: FC<PropsWithChildren> = ({ children }) => (
  <Box
    role="cell"
    sx={{
      display: 'grid',
      gridTemplateColumns: `repeat(${SHEET_COLUMNS}, minmax(0, 1fr))`,
      minWidth: 0,
      height: '100%',
      position: 'relative',
    }}
  >
    {children}
  </Box>
);
