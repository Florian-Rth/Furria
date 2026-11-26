import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const DOT_GAP = 14;

const boardPaint = (theme: Theme): CSSObject => ({
  backgroundColor: (theme.vars ?? theme).palette.background.default,
  backgroundImage: `radial-gradient(${(theme.vars ?? theme).palette.divider} 1px, transparent 1px)`,
  backgroundSize: `${DOT_GAP}px ${DOT_GAP}px`,
});

export const KkHelpPreview: FC<PropsWithChildren> = ({ children }) => (
  <Box
    aria-hidden
    inert
    data-kk-help-preview
    sx={[
      boardPaint,
      {
        position: 'relative',
        minWidth: 0,
        p: 1.5,
        borderRadius: `${kkTokens.radius.base}px`,
        border: 1.5,
        borderColor: 'divider',
        pointerEvents: 'none',
        userSelect: 'none',
      },
    ]}
  >
    {children}
  </Box>
);
