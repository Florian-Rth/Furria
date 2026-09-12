import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';
import { MAIN_ELEMENT_ID } from '../main-element-id';

const DOCK_BREATHING_ROOM = 24;
const DOCK_CLEARANCE = `${kkTokens.layout.curtainClearance + DOCK_BREATHING_ROOM}px`;

interface KkAppShellMainProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkAppShellMain: FC<KkAppShellMainProps> = ({ sx, children }) => (
  <Stack
    component="main"
    id={MAIN_ELEMENT_ID}
    tabIndex={-1}
    data-kk-app-shell-main
    sx={[
      { flex: 1, minWidth: 0, outline: 'none', pb: { xs: DOCK_CLEARANCE, desktop: 0 } },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {children}
  </Stack>
);
