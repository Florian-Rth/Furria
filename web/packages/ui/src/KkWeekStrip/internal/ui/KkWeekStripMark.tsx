import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { goldInkOf } from '../../../internal/gold-ink';
import { usePrintRun } from '../../../internal/print-in/print-run';
import { inkBleedOf } from '../../../internal/print-in/print-stamp';
import { redInk } from '../../../internal/red-ink';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkEntryKindGlyphKind } from '../../../KkEntryKindGlyph/entry-kind-glyphs';
import { KkEntryKindGlyph } from '../../../KkEntryKindGlyph/KkEntryKindGlyph';
import { kkTokens } from '../../../tokens';
import { toMarkDelaySeconds } from '../logic/strip-cue';
import { STRIP_CELL_WIDE, STRIP_MARK_SLOT } from '../strip-paint';

export type KkWeekStripMarkState = 'live' | 'owed' | 'answered' | 'plain';

const LAND_FROM = { opacity: 0, y: -10, scale: 0.4 } as const;
const LAND_TO = { opacity: 1, y: 0, scale: 1 } as const;
const LAND_SPRING = { type: 'spring', stiffness: 560, damping: 24, mass: 0.7 } as const;
const LIVE_DOT = '0.375rem';

const MARK_ROW: CSSObject = {
  alignItems: 'center',
  columnGap: 0.5,
  minWidth: 0,
  maxWidth: '100%',
};

const slotPaints: Record<KkWeekStripMarkState, (theme: Theme) => CSSObject> = {
  plain: () => ({ color: 'text.secondary' }),
  live: (theme) => redInk(theme),
  owed: (theme) => ({
    ...goldInkOf(theme),
    borderWidth: kkTokens.line.hair,
    borderStyle: 'solid',
    borderColor: 'currentColor',
  }),
  answered: () => ({ color: 'background.paper', backgroundColor: 'text.primary' }),
};

const slotPaintOf =
  (state: KkWeekStripMarkState) =>
  (theme: Theme): CSSObject => ({
    position: 'relative',
    flexShrink: 0,
    width: STRIP_MARK_SLOT,
    height: STRIP_MARK_SLOT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    ...slotPaints[state](theme),
  });

const liveDotPaintOf =
  (hidden: boolean, settled: boolean) =>
  (theme: Theme): CSSObject => ({
    position: 'absolute',
    top: -1,
    right: -2,
    width: LIVE_DOT,
    height: LIVE_DOT,
    borderRadius: '50%',
    ...redInk(theme),
    backgroundColor: 'currentColor',
    animation: kkTokens.motion.breath,
    '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    '&::after': { ...inkBleedOf(hidden, settled), inset: 0 },
  });

const TIME_PAINT: CSSObject = {
  display: 'none',
  fontWeight: 700,
  lineHeight: 1,
  color: 'text.secondary',
  fontVariantNumeric: 'tabular-nums',
  [STRIP_CELL_WIDE]: { display: 'inline' },
};

const MORE_PAINT: CSSObject = {
  ...TIME_PAINT,
  fontWeight: 800,
};

interface KkWeekStripMarkProps {
  kind: KkEntryKindGlyphKind;
  state: KkWeekStripMarkState;
  dayIndex: number;
  markIndex: number;
  time?: string;
  more?: string;
}

export const KkWeekStripMark: FC<KkWeekStripMarkProps> = ({
  kind,
  state,
  dayIndex,
  markIndex,
  time,
  more,
}) => {
  const reduced = useReducedMotion();
  const { hidden, settled } = usePrintRun();
  const entry = reduced ? false : LAND_FROM;
  const transition = { ...LAND_SPRING, delay: toMarkDelaySeconds(dayIndex, markIndex) };

  const liveDot =
    state === 'live' ? <Box component="span" sx={liveDotPaintOf(hidden, settled)} /> : null;
  const timeLabel =
    time === undefined ? null : (
      <Typography component="span" variant="caption" noWrap sx={TIME_PAINT}>
        {time}
      </Typography>
    );

  const moreLabel =
    more === undefined ? null : (
      <Typography component="span" variant="caption" noWrap sx={MORE_PAINT}>
        {more}
      </Typography>
    );

  return (
    <Stack
      component={motion.span}
      direction="row"
      initial={entry}
      animate={LAND_TO}
      transition={transition}
      sx={MARK_ROW}
    >
      <Stack component="span" sx={slotPaintOf(state)}>
        <KkEntryKindGlyph kind={kind} size="mark" />
        {liveDot}
      </Stack>
      {timeLabel}
      {moreLabel}
    </Stack>
  );
};
