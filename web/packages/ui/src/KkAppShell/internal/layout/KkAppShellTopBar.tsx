import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { KK_DARK_SCHEME_ATTRIBUTE } from '../../../theme';
import { kkTokens } from '../../../tokens';

const darkSchemeAttribute = { [KK_DARK_SCHEME_ATTRIBUTE]: '' };

interface KkAppShellTopBarProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAppShellTopBar: FC<KkAppShellTopBarProps> = ({ sx, children }) => (
  <AppBar
    position="sticky"
    elevation={0}
    color="transparent"
    {...darkSchemeAttribute}
    data-kk-app-shell-top-bar
    sx={[
      {
        display: { xs: 'block', desktop: 'none' },
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: kkTokens.line.hair,
        borderColor: 'divider',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <Toolbar sx={{ gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
      {children}
    </Toolbar>
  </AppBar>
);
