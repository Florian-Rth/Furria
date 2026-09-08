import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkAppShellRailHeadProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAppShellRailHead: FC<KkAppShellRailHeadProps> = ({ sx, children }) => (
  <Stack
    data-kk-app-shell-rail-head
    sx={[{ gap: 0.625, flexShrink: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
