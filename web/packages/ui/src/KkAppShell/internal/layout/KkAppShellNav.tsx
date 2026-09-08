import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkAppShellNavProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAppShellNav: FC<KkAppShellNavProps> = ({ sx, children }) => (
  <Stack
    component="ul"
    data-kk-app-shell-nav
    sx={[
      {
        flex: 1,
        justifyContent: { xs: 'center', desktop: 'flex-start' },
        listStyle: 'none',
        m: 0,
        p: 0,
        minWidth: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
