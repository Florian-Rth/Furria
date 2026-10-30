import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkWayViewRibbon: FC<PropsWithChildren> = ({ children }) => (
  <Box sx={{ gridArea: 'ribbon', minWidth: 0 }}>{children}</Box>
);
