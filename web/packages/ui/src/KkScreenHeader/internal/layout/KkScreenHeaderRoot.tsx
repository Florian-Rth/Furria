import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkScreenHeaderRoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-screen-header
    sx={{ alignItems: 'center', gap: 1.75, minWidth: 0 }}
  >
    {children}
  </Stack>
);
