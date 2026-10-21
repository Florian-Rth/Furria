import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, ReactNode } from 'react';
import { PANE_MARK } from '../../../internal/print-in/pane-mark';
import { PANE_SCHEME, paneLayersOf } from '../../../internal/print-in/pane-paint';
import { usePrintRun } from '../../../internal/print-in/print-run';
import { printStampOf } from '../../../internal/print-in/print-stamp';
import { applyScheme, schemeEdge } from '../../../internal/scheme-paint';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const { light, dark } = kkTokens.color;
const STRIP_DELAY_MS = 120;
const WEEK_DAYS = 7;
const LATER_SHARE = 1.6;

const rootPaintOf =
  (settled: boolean) =>
  (theme: Theme): CSSObject => ({
    ...paneLayersOf(settled),
    minWidth: 0,
    height: '100%',
    pointerEvents: 'auto',
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    borderRadius: `${kkTokens.radius.base}px`,
    ...applyScheme(theme, PANE_SCHEME, schemeEdge(light.line2, dark.line2)),
    ...printStampOf(STRIP_DELAY_MS, settled),
  });

const daysFrame = (theme: Theme): CSSObject => ({
  display: 'grid',
  gridTemplateColumns: `repeat(${WEEK_DAYS}, minmax(0, 1fr)) minmax(0, ${LATER_SHARE}fr)`,
  minWidth: 0,
  height: '100%',
  m: 0,
  p: 0.5,
  listStyle: 'none',
  '& > li + li': {
    borderLeftWidth: kkTokens.line.hair,
    borderLeftStyle: 'solid',
    ...applyScheme(theme, schemeEdge(light.line2, dark.line2)),
  },
});

interface KkWeekStripRootProps {
  label: string;
  days: ReactNode;
  sx?: KkSx;
}

export const KkWeekStripRoot: FC<KkWeekStripRootProps> = ({ label, days, sx }) => {
  const { settled } = usePrintRun();
  const pane = { [PANE_MARK]: true };

  return (
    <Box
      component="nav"
      aria-label={label}
      data-kk-week-strip
      {...pane}
      sx={[rootPaintOf(settled), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box component="ol" sx={daysFrame}>
        {days}
      </Box>
    </Box>
  );
};
