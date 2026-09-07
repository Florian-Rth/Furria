import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkAppShellUserBlock: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    direction="row"
    data-kk-app-shell-user-block
    sx={{ alignItems: 'center', gap: 1.5, minWidth: 0 }}
  >
    {children}
  </Stack>
);
