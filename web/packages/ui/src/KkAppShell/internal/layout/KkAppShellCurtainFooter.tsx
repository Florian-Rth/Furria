import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkAppShellCurtainFooterProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAppShellCurtainFooter: FC<KkAppShellCurtainFooterProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    data-kk-app-shell-curtain-footer
    sx={[
      {
        alignItems: 'center',
        gap: 1.25,
        flexShrink: 0,
        borderTop: kkTokens.line.hair,
        borderColor: 'divider',
        pt: 1.75,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
