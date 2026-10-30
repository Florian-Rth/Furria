import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkLaneCardsStage: FC<PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      flex: 1,
      minHeight: '7rem',
      minWidth: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: 'minmax(0, 1fr)',
      position: 'relative',
    }}
  >
    {children}
  </Box>
);
