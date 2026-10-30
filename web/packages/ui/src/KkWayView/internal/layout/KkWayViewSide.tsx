import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';

export const KkWayViewSide: FC<PropsWithChildren> = ({ children }) => (
  <Box sx={{ gridArea: 'side', minWidth: 0, minHeight: 0, alignSelf: 'center' }}>{children}</Box>
);
