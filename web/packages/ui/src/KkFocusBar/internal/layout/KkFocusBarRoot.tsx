import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export type KkFocusBarKind = 'float' | 'inline';

interface KkFocusBarRootProps extends PropsWithChildren {
  label: string;
  kind: KkFocusBarKind;
}

export const KkFocusBarRoot: FC<KkFocusBarRootProps> = ({ label, kind, children }) => (
  <Stack
    direction="row"
    role="toolbar"
    aria-label={label}
    data-kind={kind}
    sx={(theme) => ({
      alignItems: 'center',
      gap: 0.5,
      maxWidth: '100%',
      minWidth: 0,
      overflowX: 'auto',
      scrollbarWidth: 'none',
      '&[data-kind="float"]': {
        px: 0.5,
        py: 0.5,
        borderRadius: `${kkTokens.radius.base}px`,
        backgroundColor: palette(theme).background.paper,
        boxShadow: `${kkTokens.shadow.floating}, inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
      },
    })}
  >
    {children}
  </Stack>
);
