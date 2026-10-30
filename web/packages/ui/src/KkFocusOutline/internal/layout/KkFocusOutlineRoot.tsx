import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusOutlineRootProps extends PropsWithChildren {
  label: string;
}

export const KkFocusOutlineRoot: FC<KkFocusOutlineRootProps> = ({ label, children }) => (
  <Stack
    component="nav"
    aria-label={label}
    data-kk-focus-outline-list
    sx={(theme) => ({
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      overscrollBehavior: 'contain',
      py: 0.5,
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: palette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
    })}
  >
    {children}
  </Stack>
);
