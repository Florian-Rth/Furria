import Box from '@mui/material/Box';
import type { TypographyVariant } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { Transition } from 'motion/react';
import { AnimatePresence, motion } from 'motion/react';
import type { FC } from 'react';
import { useReducedMotion } from './internal/use-reduced-motion';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const { flap } = kkTokens.motion;
const MILLISECONDS = 1000;
const HIDDEN_ANGLE = -90;
const GONE_ANGLE = 90;

export type KkFlapCountTone = 'ink' | 'red' | 'gold';

const toneInk: Record<KkFlapCountTone, string> = {
  ink: 'inherit',
  red: 'primary.main',
  gold: 'warning.main',
};

type KkFlapCountVariant = Extract<TypographyVariant, 'h2' | 'h3' | 'h4' | 'overline'>;

interface KkFlapCountProps {
  value: string;
  variant?: KkFlapCountVariant;
  tone?: KkFlapCountTone;
  delaySeconds?: number;
  replayKey?: number;
  sx?: KkSx;
}

interface FlapSlot {
  slot: string;
  character: string;
  order: number;
}

const flapSlotsOf = (value: string): FlapSlot[] =>
  [...value].map((character, order) => ({ slot: `slot-${order}`, character, order }));

const cellTransition = (index: number, delaySeconds: number): Transition => ({
  duration: flap.finalMs / MILLISECONDS,
  delay: delaySeconds + (index * flap.staggerMs) / MILLISECONDS,
  ease: [0.2, 0.9, 0.3, 1.25],
});

export const KkFlapCount: FC<KkFlapCountProps> = ({
  value,
  variant = 'h4',
  tone = 'ink',
  delaySeconds = 0,
  replayKey = 0,
  sx,
}) => {
  const reducedMotion = useReducedMotion();
  const enter = reducedMotion ? { opacity: 0 } : { rotateX: HIDDEN_ANGLE, opacity: 0 };
  const leave = reducedMotion ? { opacity: 0 } : { rotateX: GONE_ANGLE, opacity: 0 };
  const cells = flapSlotsOf(value).map(({ slot, character, order }) => (
    <Box
      key={slot}
      component="span"
      aria-hidden
      sx={{ display: 'inline-grid', perspective: '240px' }}
    >
      <AnimatePresence initial mode="popLayout">
        <motion.span
          key={`${replayKey}-${character}`}
          initial={enter}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={leave}
          transition={cellTransition(order, delaySeconds)}
          style={{ gridArea: '1 / 1', display: 'inline-block', transformOrigin: '50% 50%' }}
        >
          {character}
        </motion.span>
      </AnimatePresence>
    </Box>
  ));

  return (
    <Typography
      component="span"
      role="img"
      aria-label={value}
      data-kk-flap-count
      sx={[
        (theme) => ({
          ...theme.typography[variant],
          fontFamily: kkTokens.font.display,
          fontWeight: kkTokens.font.displayWeight,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing: kkTokens.type.tracking.display,
          color: toneInk[tone],
          display: 'inline-flex',
          whiteSpace: 'pre',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {cells}
    </Typography>
  );
};
