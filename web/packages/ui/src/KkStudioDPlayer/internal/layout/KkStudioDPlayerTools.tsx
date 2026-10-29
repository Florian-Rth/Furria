import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkStudioDPlayerTools: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-studio-d-tools
    sx={{
      display: 'grid',
      gridAutoFlow: 'column',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridAutoColumns: 'auto',
      alignItems: 'center',
      justifyItems: 'start',
      gap: 1,
      minWidth: 0,
    }}
  >
    {children}
  </Box>
);
