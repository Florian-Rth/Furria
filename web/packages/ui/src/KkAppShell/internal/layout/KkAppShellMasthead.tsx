import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkAppShellMastheadProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAppShellMasthead: FC<KkAppShellMastheadProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    data-kk-app-shell-masthead
    sx={[
      {
        display: { xs: 'flex', desktop: 'none' },
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        pt: 1,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
