import Stack from '@mui/material/Stack';
import type { FC, Ref } from 'react';
import { safeArea } from '../../../internal/safe-area';
import { kkTokens } from '../../../tokens';

const { gutter, indexWidth } = kkTokens.shell;

interface KkShellIndexProps {
  headClearance: number;
  footClearance: number;
  ref?: Ref<HTMLDivElement>;
}

export const KkShellIndex: FC<KkShellIndexProps> = ({ headClearance, footClearance, ref }) => (
  <Stack
    ref={ref}
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
      '&:empty': { display: 'none' },
      '& > *': { pointerEvents: 'auto' },
    }}
  />
);
