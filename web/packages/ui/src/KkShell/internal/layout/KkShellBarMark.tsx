import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

export const KkShellBarMark: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    data-kk-shell-bar-mark
    sx={{
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      width: kkTokens.tapTarget,
      height: kkTokens.tapTarget,
    }}
  >
    {children}
  </Stack>
);
