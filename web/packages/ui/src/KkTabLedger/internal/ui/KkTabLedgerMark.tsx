import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { redInk } from '../../../internal/red-ink';

export type KkTabLedgerState =
  | 'open'
  | 'overdue'
  | 'paid'
  | 'settles'
  | 'stays'
  | 'fresh'
  | 'stockIn'
  | 'stockOut';

const SIZE = '0.875rem';

const markPaint =
  (state: KkTabLedgerState) =>
  (theme: Theme): CSSObject => {
    const palette = (theme.vars ?? theme).palette;
    const ink: Record<KkTabLedgerState, CSSObject> = {
      open: { color: palette.text.primary },
      overdue: goldInkOf(theme),
      paid: { color: palette.text.disabled },
      settles: { color: palette.text.primary },
      stays: { color: palette.text.disabled },
      fresh: redInk(theme),
      stockIn: { color: palette.text.primary },
      stockOut: { color: palette.text.secondary },
    };

    return {
      display: 'block',
      flexShrink: 0,
      width: SIZE,
      height: SIZE,
      fill: 'none',
      stroke: 'currentColor',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ...ink[state],
    };
  };

const PATHS: Record<KkTabLedgerState, string> = {
  open: 'M7 2v10',
  overdue: 'M7 2v10',
  paid: 'M7 2v10',
  fresh: 'M7 2v10',
  stays: 'M7 2v10',
  settles: 'M2.5 7.5l3 3 6-7',
  stockIn: 'M7 2.5v9M2.5 7h9',
  stockOut: 'M2.5 7h9',
};

const WIDTHS: Record<KkTabLedgerState, number> = {
  open: 2.4,
  overdue: 2.4,
  paid: 2.4,
  fresh: 2.4,
  stays: 2.4,
  settles: 2,
  stockIn: 2,
  stockOut: 2,
};

interface KkTabLedgerMarkProps {
  state: KkTabLedgerState;
}

export const KkTabLedgerMark: FC<KkTabLedgerMarkProps> = ({ state }) => (
  <Box component="svg" aria-hidden viewBox="0 0 14 14" sx={markPaint(state)}>
    <path d={PATHS[state]} strokeWidth={WIDTHS[state]} />
  </Box>
);
