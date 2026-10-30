import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkTrainingViewGaps: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-training-gaps sx={{ gridArea: 'gaps', alignSelf: 'start', minWidth: 0 }}>
    {children}
  </Box>
);
