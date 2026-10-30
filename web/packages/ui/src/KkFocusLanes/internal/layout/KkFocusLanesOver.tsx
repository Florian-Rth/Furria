import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkFocusLanesOver: FC<PropsWithChildren> = ({ children }) => (
  <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}>{children}</Box>
);
