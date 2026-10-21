import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC, ReactNode } from 'react';
import { usePrintRun } from '../../../internal/print-in/print-run';
import { PRINT_EASE, PRINT_STILL, REDUCED_MOTION } from '../../../internal/print-in/print-stamp';
import { redInk } from '../../../internal/red-ink';
import { applyScheme, schemeFill } from '../../../internal/scheme-paint';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { kkTokens } from '../../../tokens';
import { toDayDelaySeconds } from '../logic/strip-cue';
import { STRIP_CELL_CONTAINER, STRIP_CELL_WIDE, STRIP_MARK_GAP } from '../strip-paint';

export type KkWeekStripDayTone = 'today' | 'day' | 'later';

const BAR_FROM = { scaleX: 0 } as const;
const BAR_TO = { scaleX: 1 } as const;
const BAR_SECONDS = 0.36;

const { light, dark } = kkTokens.color;
const DAY_LEAD_MS = 220;
const DAY_STEP_MS = 55;
const DAY_MS = 380;

const dayStamp = keyframes`
  0% {
    opacity: 0;
    transform: scale(1.08);
  }
  55% {
    opacity: 1;
    transform: scale(0.985);
  }
  100% {
    opacity: 1;
    transform: none;
  }
`;

const inkFlash = keyframes`
  0% {
    opacity: 0;
  }
  35% {
    opacity: 0.22;
  }
  100% {
    opacity: 0;
  }
`;

const cellItemPaintOf =
  (index: number, settled: boolean) =>
  (theme: Theme): CSSObject => {
    const delay = `${DAY_LEAD_MS + index * DAY_STEP_MS}ms`;

    return {
      position: 'relative',
      minWidth: 0,
      containerType: 'inline-size',
      containerName: STRIP_CELL_CONTAINER,
      ...(settled
        ? PRINT_STILL
        : {
            animation: `${dayStamp} ${DAY_MS}ms ${PRINT_EASE} ${delay} both`,
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: 2,
              borderRadius: `${kkTokens.radius.base - 4}px`,
              ...applyScheme(theme, schemeFill(light.ink, dark.ink)),
              pointerEvents: 'none',
              opacity: 0,
              animation: `${inkFlash} ${DAY_MS}ms ease-out ${delay} both`,
            },
            [REDUCED_MOTION]: { ...PRINT_STILL, '&::after': PRINT_STILL },
          }),
    };
  };

const cellPaint = (theme: Theme): CSSObject => ({
  width: '100%',
  height: '100%',
  minWidth: 0,
  alignItems: 'center',
  justifyContent: 'flex-start',
  rowGap: 0.25,
  px: 0.25,
  pt: 0.75,
  pb: 1,
  borderRadius: `${kkTokens.radius.base - 4}px`,
  color: 'text.primary',
  textAlign: 'center',
  [STRIP_CELL_WIDE]: { alignItems: 'flex-start', px: 0.75, textAlign: 'left' },
  '&:focus-visible': {
    outline: `${kkTokens.line.section}px solid`,
    outlineColor: (theme.vars ?? theme).palette.primary.main,
    outlineOffset: -kkTokens.line.section,
  },
  '@media (hover: hover)': {
    '&:is(button):hover': { backgroundColor: 'action.hover' },
  },
});

const weekdayPaintOf =
  (tone: KkWeekStripDayTone) =>
  (theme: Theme): CSSObject => ({
    fontWeight: kkTokens.eyebrow.fontWeight,
    letterSpacing: kkTokens.type.tracking.tight,
    [STRIP_CELL_WIDE]: { letterSpacing: kkTokens.type.tracking.label },
    lineHeight: 1.2,
    color: 'text.secondary',
    ...(tone === 'today' ? redInk(theme) : {}),
  });

const numberPaintOf =
  (tone: KkWeekStripDayTone, quiet: boolean) =>
  (theme: Theme): CSSObject => ({
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: kkTokens.type.tracking.tight,
    lineHeight: 1.05,
    color: quiet ? 'text.disabled' : 'text.primary',
    ...(tone === 'today' ? redInk(theme) : {}),
    ...(tone === 'later' && !quiet ? { color: 'text.secondary' } : {}),
  });

const barPaint = (theme: Theme): CSSObject => ({
  display: 'block',
  width: '1.25rem',
  height: kkTokens.line.section,
  borderRadius: `${kkTokens.radius.bar}px`,
  transformOrigin: 'left center',
  ...redInk(theme),
  backgroundColor: 'currentColor',
});

const BAR_ROOM: CSSObject = { display: 'block', height: kkTokens.line.section };

const MARKS_FRAME: CSSObject = {
  alignItems: 'center',
  rowGap: STRIP_MARK_GAP,
  minWidth: 0,
  maxWidth: '100%',
  mt: 0.5,
  [STRIP_CELL_WIDE]: { alignItems: 'flex-start' },
};

const OVERFLOW_PAINT: CSSObject = {
  [STRIP_CELL_WIDE]: { display: 'none' },
  fontWeight: 800,
  lineHeight: 1,
  color: 'text.secondary',
  fontVariantNumeric: 'tabular-nums',
};

interface KkWeekStripDayProps {
  weekday: string;
  number: string;
  tone: KkWeekStripDayTone;
  index: number;
  label: string;
  marks: ReactNode;
  overflow?: string;
  onSelect?: () => void;
}

export const KkWeekStripDay: FC<KkWeekStripDayProps> = ({
  weekday,
  number,
  tone,
  index,
  label,
  marks,
  overflow,
  onSelect,
}) => {
  const reduced = useReducedMotion();
  const { settled } = usePrintRun();
  const quiet = onSelect === undefined;
  const barEntry = reduced ? false : BAR_FROM;
  const barTransition = {
    delay: toDayDelaySeconds(index),
    duration: BAR_SECONDS,
    ease: 'easeOut',
  } as const;

  const bar =
    tone === 'today' ? (
      <Box
        component={motion.span}
        aria-hidden
        initial={barEntry}
        animate={BAR_TO}
        transition={barTransition}
        sx={barPaint}
      />
    ) : (
      <Box component="span" aria-hidden sx={BAR_ROOM} />
    );

  const overflowLine =
    overflow === undefined ? null : (
      <Typography component="span" variant="caption" aria-hidden sx={OVERFLOW_PAINT}>
        {overflow}
      </Typography>
    );

  const face = (
    <>
      <Typography component="span" variant="caption" aria-hidden noWrap sx={weekdayPaintOf(tone)}>
        {weekday}
      </Typography>
      <Typography component="span" variant="h3" aria-hidden sx={numberPaintOf(tone, quiet)}>
        {number}
      </Typography>
      {bar}
      <Stack component="span" aria-hidden sx={MARKS_FRAME}>
        {marks}
        {overflowLine}
      </Stack>
    </>
  );

  const cell = quiet ? (
    <Stack component="div" role="img" aria-label={label} sx={cellPaint}>
      {face}
    </Stack>
  ) : (
    <Stack
      component={ButtonBase}
      disableRipple
      aria-label={label}
      aria-current={tone === 'today' ? 'date' : undefined}
      onClick={onSelect}
      sx={cellPaint}
    >
      {face}
    </Stack>
  );

  return (
    <Box component="li" sx={cellItemPaintOf(index, settled)}>
      {cell}
    </Box>
  );
};
