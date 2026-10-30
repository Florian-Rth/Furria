import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkTwinHead: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    component="header"
    data-kk-twin-head
    sx={{ gridArea: 'head', alignItems: 'center', gap: 1, minWidth: 0 }}
  >
    {children}
  </Stack>
);
