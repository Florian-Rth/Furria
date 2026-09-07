import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';

interface KkAppShellUserBlockProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAppShellUserBlock: FC<KkAppShellUserBlockProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    data-kk-app-shell-user-block
    sx={[{ alignItems: 'center', gap: 1.5, minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {children}
  </Stack>
);
