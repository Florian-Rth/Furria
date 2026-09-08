import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkAppShellMainProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAppShellMain: FC<KkAppShellMainProps> = ({ sx, children }) => (
  <Stack
    component="main"
    data-kk-app-shell-main
    sx={[{ flex: 1, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
