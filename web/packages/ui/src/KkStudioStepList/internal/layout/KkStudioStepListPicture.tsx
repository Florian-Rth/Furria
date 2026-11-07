import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkStudioStepListPicture: FC<PropsWithChildren> = ({ children }) => (
  <Stack
    aria-hidden
    sx={(theme) => ({
      flex: '1 1 0',
      minWidth: 0,
      borderRadius: `${kkTokens.radius.bar * 2}px`,
      overflow: 'clip',
      backgroundColor: palette(theme).action.hover,
    })}
  >
    {children}
  </Stack>
);
