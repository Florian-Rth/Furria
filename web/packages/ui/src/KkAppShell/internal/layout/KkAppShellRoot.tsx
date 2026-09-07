import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkAppShellRootProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAppShellRoot: FC<KkAppShellRootProps> = ({ sx, children }) => (
  <Stack
    direction={{ xs: 'column', desktop: 'row' }}
    data-kk-app-shell
    sx={[
      { minHeight: '100dvh', bgcolor: 'background.default' },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
