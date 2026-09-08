import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkAppShellUserRowProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAppShellUserRow: FC<KkAppShellUserRowProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    data-kk-app-shell-user-row
    sx={[
      {
        alignItems: 'center',
        gap: 1.375,
        minWidth: 0,
        flexShrink: 0,
        borderTop: kkTokens.line.hair,
        borderColor: 'divider',
        pt: 2,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
