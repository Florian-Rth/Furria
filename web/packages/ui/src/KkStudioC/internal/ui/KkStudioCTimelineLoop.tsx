import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { accentWash } from '../../../internal/accent-wash';
import { kkTokens } from '../../../tokens';

const loopPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  zIndex: 1,
  pointerEvents: 'none',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    opacity: 0.45,
    ...accentWash(theme),
  },
  borderLeftWidth: kkTokens.line.section,
  borderRightWidth: kkTokens.line.section,
  borderLeftStyle: 'solid',
  borderRightStyle: 'solid',
  borderLeftColor: (theme.vars ?? theme).palette.primary.main,
  borderRightColor: (theme.vars ?? theme).palette.primary.main,
});

interface KkStudioCTimelineLoopProps {
  left: number;
  width: number;
}

export const KkStudioCTimelineLoop: FC<KkStudioCTimelineLoopProps> = ({ left, width }) => {
  const place = { left, width };

  return <Box aria-hidden data-kk-studio-c-loop style={place} sx={loopPaint} />;
};
