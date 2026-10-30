import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkWayViewHead: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    component="header"
    sx={{ gridArea: 'head', alignItems: 'center', gap: 1.5, minWidth: 0 }}
  >
    {children}
  </Stack>
);
