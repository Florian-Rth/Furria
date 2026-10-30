import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { arrivalOf } from '../KkStudioGDesk/internal/layout/kk-studio-g-arrival';

export const KkStudioGArrive: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-studio-g-arrive sx={{ width: '100%', ...arrivalOf('settle', 0) }}>
    {children}
  </Box>
);
