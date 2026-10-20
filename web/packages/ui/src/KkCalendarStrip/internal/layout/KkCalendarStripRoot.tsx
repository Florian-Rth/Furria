import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { KkChrome } from '../../../internal/KkChrome';
import { safeArea } from '../../../internal/safe-area';
import type { KkSx } from '../../../kk-sx';
import { KK_CALENDAR_STICKY } from '../../calendar-sticky';

const DENSE = 1;
const STRIP_LAYER = 3;

const cardPaint = (theme: Theme): CSSObject => {
  const paper = (theme.vars ?? theme).palette.background.paper;

  return {
    position: 'relative',
    minHeight: '100%',
    px: 0.5,
    pt: `${KK_CALENDAR_STICKY.stripPad}px`,
    minWidth: 0,
    backgroundColor: paper,
    ...theme.applyStyles('dark', { backgroundColor: paper }),
  };
};

interface KkCalendarStripRootProps extends PropsWithChildren {
  label: string;
  expanded: boolean;
  sx?: KkSx;
}

export const KkCalendarStripRoot: FC<KkCalendarStripRootProps> = ({
  label,
  expanded,
  sx,
  children,
}) => (
  <Box
    component="section"
    aria-label={label}
    data-kk-calendar-strip={expanded ? 'open' : 'closed'}
    sx={[
      {
        position: 'sticky',
        top: safeArea('top', KK_CALENDAR_STICKY.stripTop - KK_CALENDAR_STICKY.chromeGap),
        zIndex: STRIP_LAYER,
        boxSizing: 'content-box',
        height: `${KK_CALENDAR_STICKY.stripHeight}px`,
        pt: `${KK_CALENDAR_STICKY.chromeGap}px`,
        pb: `${KK_CALENDAR_STICKY.headGap}px`,
        backgroundColor: 'background.default',
        minWidth: 0,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <KkChrome density={DENSE} sx={cardPaint}>
      {children}
    </KkChrome>
  </Box>
);
