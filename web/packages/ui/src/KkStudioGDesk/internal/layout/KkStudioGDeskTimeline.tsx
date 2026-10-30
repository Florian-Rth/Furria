import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { arrivalOf } from './kk-studio-g-arrival';

export const KkStudioGDeskTimeline: FC<PropsWithChildren> = ({ children }) => (
  <Box
    data-kk-studio-g-timeline
    sx={{
      gridArea: 'timeline',
      display: 'grid',
      minWidth: 0,
      minHeight: 0,
      ...arrivalOf('rise', 2),
    }}
  >
    {children}
  </Box>
);
