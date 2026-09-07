import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

export const KkAppShellNav: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="nav"
    aria-label="Hauptnavigation"
    data-kk-app-shell-nav
    sx={{ flexGrow: 1, gap: 0.5, minWidth: 0 }}
  >
    {children}
  </Stack>
);
