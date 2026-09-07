import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkAppShellNavProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAppShellNav: FC<KkAppShellNavProps> = ({ sx, children }) => (
  <Stack
    component="nav"
    aria-label="Hauptnavigation"
    data-kk-app-shell-nav
    sx={[{ flexGrow: 1, gap: 0.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
