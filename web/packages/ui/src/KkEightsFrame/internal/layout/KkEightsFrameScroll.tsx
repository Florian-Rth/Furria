import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkEightsFrameScroll: FC<PropsWithChildren> = ({ children }) => (
  <Box sx={{ flex: 1, minHeight: 0, position: 'relative', overflowY: 'auto' }}>{children}</Box>
);
