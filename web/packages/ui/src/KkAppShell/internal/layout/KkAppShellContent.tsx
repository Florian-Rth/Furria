import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkAppShellContentProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAppShellContent: FC<KkAppShellContentProps> = ({ sx, children }) => (
  <Stack
    component="main"
    data-kk-app-shell-content
    sx={[
      {
        flex: 1,
        minWidth: 0,
        gap: { xs: 3, desktop: 4 },
        px: { xs: 2.5, desktop: 5 },
        py: { xs: 3, desktop: 4 },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
