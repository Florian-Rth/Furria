import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkFocusLanesNames: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    sx={(theme) => ({
      minWidth: 0,
      borderRight: `${kkTokens.line.hair}px solid ${palette(theme).divider}`,
    })}
  >
    {children}
  </Stack>
);
