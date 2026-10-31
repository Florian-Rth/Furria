import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkLaneDeskPanelProps extends PropsWithChildren {
  label: string;
  padded?: boolean;
  fit?: boolean;
}

export const KkLaneDeskPanel: FC<KkLaneDeskPanelProps> = ({
  label,
  padded = false,
  fit = false,
  children,
}) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-lane-panel
    sx={(theme) => ({
      position: 'relative',
      alignSelf: fit ? 'start' : 'stretch',
      maxHeight: '100%',
      minWidth: 0,
      minHeight: 0,
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gridTemplateRows: padded ? 'auto minmax(0, 1fr)' : 'minmax(0, 1fr)',
      gap: padded ? 0.5 : 0,
      p: padded ? 1 : 0,
      borderRadius: `${kkTokens.radius.base}px`,
      backgroundColor: palette(theme).background.paper,
      boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
      overflow: 'clip',
    })}
  >
    {children}
  </Box>
);
