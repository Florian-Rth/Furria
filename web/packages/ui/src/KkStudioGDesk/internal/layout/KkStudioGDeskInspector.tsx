import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { arrivalOf } from './kk-studio-g-arrival';

export const KkStudioGDeskInspector: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-studio-g-inspector
    sx={{
      gridArea: 'inspector',
      display: 'grid',
      minWidth: 0,
      minHeight: 0,
      ...arrivalOf('rise', 3),
    }}
  >
    {children}
  </Box>
);
