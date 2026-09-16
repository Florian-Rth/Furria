import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { safeArea } from '../../../internal/safe-area';
import { kkTokens } from '../../../tokens';

const { gutter, indexWidth } = kkTokens.shell;

interface KkShellIndexProps extends PropsWithChildren {
  headClearance: number;
  footClearance: number;
}

export const KkShellIndex: FC<KkShellIndexProps> = ({ headClearance, footClearance, children }) => (
  <Stack
    data-kk-shell-index
    sx={{
      position: 'fixed',
      top: safeArea('top', headClearance),
      bottom: safeArea('bottom', footClearance),
      right: safeArea('right', gutter),
      width: `${indexWidth}px`,
      minWidth: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: kkTokens.layout.letterRailZ,
      pointerEvents: 'none',
      '& > *': { pointerEvents: 'auto' },
    }}
  >
    {children}
  </Stack>
);
