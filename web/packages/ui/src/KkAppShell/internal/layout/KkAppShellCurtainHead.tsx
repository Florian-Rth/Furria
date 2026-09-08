import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkAppShellCurtainHeadProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAppShellCurtainHead: FC<KkAppShellCurtainHeadProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    data-kk-app-shell-curtain-head
    sx={[
      { alignItems: 'center', gap: 1.375, minWidth: 0, flexShrink: 0 },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
