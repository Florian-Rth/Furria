import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { safeArea } from '../../../internal/safe-area';
import { kkTokens } from '../../../tokens';

const { gutter, chromeGap } = kkTokens.shell;
const NO_INSET = 0;

interface KkShellFootProps extends PropsWithChildren {
  raise: number;
}

export const KkShellFoot: FC<KkShellFootProps> = ({ raise, children }) => (
  <Stack
    data-kk-shell-foot
    sx={(theme) => ({
      position: 'fixed',
      bottom: raise === NO_INSET ? safeArea('bottom', gutter) : `${raise + gutter}px`,
      left: safeArea('left', gutter),
      right: safeArea('right', gutter),
      zIndex: theme.zIndex.appBar,
      minWidth: 0,
      gap: `${chromeGap}px`,
      pointerEvents: 'none',
      '& > *': { pointerEvents: 'auto' },
    })}
  >
    {children}
  </Stack>
);
