import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkTrainingViewControls: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-training-controls sx={{ gridArea: 'controls', minWidth: 0 }}>
    {children}
  </Box>
);
