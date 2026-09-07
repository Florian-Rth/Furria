import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { KK_DARK_SCHEME_ATTRIBUTE } from '../../../theme';
import { kkTokens } from '../../../tokens';

const SIDEBAR_WIDTH = 256;

const darkSchemeAttribute = { [KK_DARK_SCHEME_ATTRIBUTE]: '' };

export const KkAppShellSidebar: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    component="aside"
    {...darkSchemeAttribute}
    data-kk-app-shell-sidebar
    sx={{
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
    }}
  >
    {children}
  </Stack>
);
