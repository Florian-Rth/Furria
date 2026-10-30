import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkTrainingViewHead: FC<PropsWithChildren> = ({ children }) => (
  <Box data-kk-training-head sx={{ gridArea: 'head', minWidth: 0 }}>
    {children}
  </Box>
);
