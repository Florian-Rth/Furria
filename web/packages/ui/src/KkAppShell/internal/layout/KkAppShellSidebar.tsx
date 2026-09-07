import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { KK_DARK_SCHEME_ATTRIBUTE } from '../../../theme';
import { kkTokens } from '../../../tokens';

const SIDEBAR_WIDTH = 256;

const darkSchemeAttribute = { [KK_DARK_SCHEME_ATTRIBUTE]: '' };

interface KkAppShellSidebarProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAppShellSidebar: FC<KkAppShellSidebarProps> = ({ sx, children }) => (
  <Stack
    component="aside"
    {...darkSchemeAttribute}
    data-kk-app-shell-sidebar
    sx={[
      {
        display: { xs: 'none', desktop: 'flex' },
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        height: '100dvh',
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderRight: kkTokens.line.hair,
        borderColor: 'divider',
        gap: 3,
        px: 2,
        py: 3,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
