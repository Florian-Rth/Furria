import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { safeArea } from '../../../internal/safe-area';
import { kkTokens } from '../../../tokens';

const { gutter } = kkTokens.shell;

export const KkShellFoot: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-shell-foot
    sx={(theme) => ({
      position: 'fixed',
      bottom: safeArea('bottom', gutter),
      left: safeArea('left', gutter),
      right: safeArea('right', gutter),
      zIndex: theme.zIndex.appBar,
      minWidth: 0,
    })}
  >
    {children}
  </Stack>
);
