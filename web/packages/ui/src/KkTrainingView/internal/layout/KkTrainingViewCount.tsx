import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkTrainingViewCount: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-training-count sx={{ gridArea: 'count', minWidth: 0 }}>
    {children}
  </Box>
);
