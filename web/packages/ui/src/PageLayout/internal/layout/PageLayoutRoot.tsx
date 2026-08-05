import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const PageLayoutRoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack component="main" data-kk-page sx={{ flex: 1, overflowX: 'clip' }}>
    {children}
  </Stack>
);
