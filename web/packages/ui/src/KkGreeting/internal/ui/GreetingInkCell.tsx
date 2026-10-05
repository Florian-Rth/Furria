import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { MotionValue } from 'motion/react';
import { easeOut, motion, useTransform } from 'motion/react';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { applyScheme, schemeInk } from '../../../internal/scheme-paint';
import { skeletonSurface } from '../../../internal/skeleton-shimmer';
import { kkTokens } from '../../../tokens';
import type { FlapCell } from '../logic/flap-cells';
import type { GreetingCue } from '../logic/greeting-cues';
import { cueShareAt } from '../logic/greeting-cues';

const FESTIVE_STAR = '"✶" / ""';
const VEIL_INSET = '1px 0';

const veilPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  display: 'inline-block',
  color: 'transparent',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: VEIL_INSET,
    borderRadius: `${kkTokens.radius.bar}px`,
    ...skeletonSurface(theme),
  },
});

const festiveNamePaint = (theme: Theme): CSSObject => ({
  ...applyScheme(theme, schemeInk(kkTokens.color.light.goldInk, kkTokens.color.dark.goldInk)),
  '&::after': { content: FESTIVE_STAR, marginLeft: '0.08em' },
});

const inkPaintOf = (
  cell: FlapCell,
  festive: boolean,
): ((theme: Theme) => CSSObject) | undefined => {
  if (cell.accent) {
    return redInk;
  }

  return festive && cell.role === 'name' ? festiveNamePaint : undefined;
};

interface GreetingInkCellProps {
  cell: FlapCell;
  cue: GreetingCue;
  clock: MotionValue<number>;
  festive: boolean;
}

export const GreetingInkCell: FC<GreetingInkCellProps> = ({ cell, cue, clock, festive }) => {
  const ink = cue.stance === 'veiled' ? veilPaint : inkPaintOf(cell, festive);
  const opacity = useTransform(clock, (elapsed: number): number =>
    easeOut(cueShareAt(cue, elapsed)),
  );
  const shown = { opacity };

  return (
    <>
      {cell.lead}
      <Box component={motion.span} data-kk-flap-cell style={shown} sx={ink}>
        {cell.face}
      </Box>
      {cell.trail}
    </>
  );
};
