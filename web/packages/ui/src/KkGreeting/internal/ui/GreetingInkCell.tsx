import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import { applyScheme, schemeInk } from '../../../internal/scheme-paint';
import { skeletonSurface } from '../../../internal/skeleton-shimmer';
import { kkTokens } from '../../../tokens';
import type { FlapCell } from '../logic/flap-cells';
import type { GreetingCue } from '../logic/greeting-cues';

const FESTIVE_STAR = '"✶" / ""';
const VEIL_INSET = '1px 0';
const UNSEEN = { opacity: 0 } as const;

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
  festive: boolean;
}

export const GreetingInkCell: FC<GreetingInkCellProps> = ({ cell, cue, festive }) => {
  const ink = cue.stance === 'veiled' ? veilPaint : inkPaintOf(cell, festive);
  const target = { opacity: cue.opacity };
  const transition = { delay: cue.delay, duration: cue.duration, ease: 'easeOut' as const };
  const entry = cue.stance === 'moving' ? UNSEEN : false;

  return (
    <>
      {cell.lead}
      <Box
        key={cue.stance}
        component={motion.span}
        data-kk-flap-cell
        initial={entry}
        animate={target}
        transition={transition}
        sx={ink}
      >
        {cell.face}
      </Box>
      {cell.trail}
    </>
  );
};
