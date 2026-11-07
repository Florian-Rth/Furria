import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkEjPanelFrame: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-ej-frame
    sx={{
      minHeight: 0,
      minWidth: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'auto minmax(0, 1fr)',
      gap: 1,
      p: 1,
    }}
  >
    {children}
  </Box>
);
