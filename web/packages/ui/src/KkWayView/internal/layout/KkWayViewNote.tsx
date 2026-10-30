import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkWayViewNote: FC<PropsWithChildren> = ({ children }) => (
  <Box sx={{ gridArea: 'note', minWidth: 0 }}>{children}</Box>
);
