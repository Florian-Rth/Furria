import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusTopRootProps extends PropsWithChildren {
  label: string;
}

export const KkFocusTopRoot: FC<KkFocusTopRootProps> = ({ label, children }) => (
  <Stack
    direction="row"
    role="toolbar"
    aria-label={label}
    data-kk-focus-top-bar
    sx={(theme) => ({
      alignItems: 'center',
      gap: 0.5,
      minWidth: 0,
      px: 0.75,
      py: 0.5,
      overflowX: 'auto',
      scrollbarWidth: 'none',
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: palette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
    })}
  >
    {children}
  </Stack>
);
