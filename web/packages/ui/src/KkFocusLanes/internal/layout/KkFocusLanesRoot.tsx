import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusLanesRootProps extends PropsWithChildren {
  label: string;
}

export const KkFocusLanesRoot: FC<KkFocusLanesRootProps> = ({ label, children }) => (
  <Box
    role="group"
    aria-label={label}
    data-kk-focus-lanes
    sx={(theme) => ({
      display: 'grid',
      gridTemplateColumns: 'minmax(4.5rem, 6rem) minmax(0, 1fr)',
      minWidth: 0,
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: palette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
      overflow: 'clip',
    })}
  >
    {children}
  </Box>
);
