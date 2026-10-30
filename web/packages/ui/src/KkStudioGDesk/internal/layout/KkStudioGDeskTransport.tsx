import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { arrivalOf } from './kk-studio-g-arrival';

export const KkStudioGDeskTransport: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-studio-g-transport
    sx={{
      gridArea: 'transport',
      display: 'grid',
      minWidth: 0,
      minHeight: 0,
      ...arrivalOf('rise', 1),
    }}
  >
    {children}
  </Box>
);
