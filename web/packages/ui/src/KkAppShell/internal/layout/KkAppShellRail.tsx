import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { KkAppShellGlow } from '../ui/KkAppShellGlow';

const RAIL_WIDTH = 316;
const RAIL_BORDER = 1.5;
const GLOW = { width: 420, height: 360, top: -70 } as const;

interface KkAppShellRailProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAppShellRail: FC<KkAppShellRailProps> = ({ sx, children }) => (
  <Stack
    component="nav"
    data-kk-app-shell-rail
    sx={[
      (theme) => ({
        display: { xs: 'none', desktop: 'flex' },
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        height: '100dvh',
        flex: `0 0 ${RAIL_WIDTH}px`,
        overflow: 'hidden',
        isolation: 'isolate',
        backgroundColor: kkTokens.chrome.light.base,
        ...theme.applyStyles('dark', { backgroundColor: kkTokens.chrome.dark.base }),
        color: 'text.primary',
        borderRight: RAIL_BORDER,
        borderRightStyle: 'solid',
        borderColor: 'divider',
        px: 3,
        pt: 3.25,
        pb: 2.75,
        gap: 3.25,
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <KkAppShellGlow tone="gold" {...GLOW} centred />
    {children}
  </Stack>
);
