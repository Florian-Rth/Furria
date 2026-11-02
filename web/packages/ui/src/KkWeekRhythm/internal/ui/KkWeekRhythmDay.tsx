import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import type { FC } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import { groupToneFieldPaint } from '../../../internal/group-tone';
import { applyScheme, schemeEdge } from '../../../internal/scheme-paint';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { kkTokens } from '../../../tokens';

const { light, dark } = kkTokens.color;
const LIT_FROM = { opacity: 0, y: 8, scale: 0.6 } as const;
const LIT_TO = { opacity: 1, y: 0, scale: 1 } as const;
const LIT_SPRING = { type: 'spring', stiffness: 460, damping: 22, mass: 0.8 } as const;
const LEAD_SECONDS = 0.12;
const STEP_SECONDS = 0.06;

const WEEKDAY_PAINT: CSSObject = {
  fontWeight: kkTokens.eyebrow.fontWeight,
  letterSpacing: kkTokens.type.tracking.label,
  lineHeight: 1.2,
  textTransform: 'uppercase',
  color: 'text.secondary',
};

const CELL_FRAME: CSSObject = {
  flexGrow: 1,
  width: '100%',
  minWidth: 0,
  minHeight: '2.75rem',
  alignItems: 'center',
  justifyContent: 'center',
  rowGap: 0.25,
  px: 0.25,
  py: 0.75,
  borderRadius: `${kkTokens.radius.base - 4}px`,
};

const restPaint = (theme: Theme): CSSObject => ({
  ...CELL_FRAME,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'dashed',
  ...applyScheme(theme, schemeEdge(light.line, dark.line)),
});

const litPaintOf =
  (tone: KkGroupTone) =>
  (theme: Theme): CSSObject => ({
    ...CELL_FRAME,
    ...groupToneFieldPaint(theme, tone),
  });

const TIME_PAINT: CSSObject = {
  fontWeight: 800,
  lineHeight: 1.1,
  fontVariantNumeric: 'tabular-nums',
  letterSpacing: kkTokens.type.tracking.tight,
  color: 'inherit',
};

interface KkWeekRhythmDayProps {
  weekday: string;
  label: string;
  times: readonly string[];
  tone: KkGroupTone;
  index: number;
}

export const KkWeekRhythmDay: FC<KkWeekRhythmDayProps> = ({
  weekday,
  label,
  times,
  tone,
  index,
}) => {
  const reduced = useReducedMotion();
  const isLit = times.length > 0;
  const entry = reduced ? false : LIT_FROM;
  const transition = { ...LIT_SPRING, delay: LEAD_SECONDS + index * STEP_SECONDS };

  const timeLines = times.map((time) => (
    <Typography key={time} component="span" variant="caption" noWrap sx={TIME_PAINT}>
      {time}
    </Typography>
  ));

  const cell = isLit ? (
    <Stack
      component={motion.span}
      initial={entry}
      animate={LIT_TO}
      transition={transition}
      sx={litPaintOf(tone)}
    >
      {timeLines}
    </Stack>
  ) : (
    <Stack component="span" sx={restPaint} />
  );

  return (
    <Box component="li" aria-label={label} sx={{ minWidth: 0 }}>
      <Stack aria-hidden sx={{ alignItems: 'center', gap: 0.5, minWidth: 0, height: '100%' }}>
        <Typography component="span" variant="caption" noWrap sx={WEEKDAY_PAINT}>
          {weekday}
        </Typography>
        {cell}
      </Stack>
    </Box>
  );
};
