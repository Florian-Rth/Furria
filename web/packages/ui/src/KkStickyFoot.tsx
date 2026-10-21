import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { safeArea } from './internal/safe-area';
import { kkTokens } from './tokens';

const FOOT_BOTTOM = 12;

export type KkStickyFootSurface = 'paper' | 'page';

interface KkStickyFootProps extends PropsWithChildren {
  surface?: KkStickyFootSurface;
}

export const KkStickyFoot: FC<KkStickyFootProps> = ({ surface = 'paper', children }) => (
  <Stack
    data-kk-step-pane-foot={surface === 'paper' ? true : undefined}
    data-kk-sticky-foot={surface}
    sx={{
      position: 'sticky',
      bottom: 0,
      zIndex: 1,
      gap: 0.5,
      minWidth: 0,
      pt: 1.5,
      pb: safeArea('bottom', FOOT_BOTTOM),
      bgcolor: surface === 'paper' ? 'background.paper' : 'background.default',
      borderTopWidth: kkTokens.line.hair,
      borderTopStyle: 'solid',
      borderTopColor: 'divider',
    }}
  >
    {children}
  </Stack>
);
