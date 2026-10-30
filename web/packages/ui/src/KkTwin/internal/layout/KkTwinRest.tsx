import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkTwinRest: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-twin-rest
    sx={{ gridRow: '2 / 4', display: 'grid', placeItems: 'center', minWidth: 0, minHeight: 0 }}
  >
    {children}
  </Box>
);
