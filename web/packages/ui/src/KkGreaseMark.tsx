import Box from '@mui/material/Box';
import type { Transition } from 'motion/react';
import { motion } from 'motion/react';
import type { FC } from 'react';
import { useReducedMotion } from './internal/use-reduced-motion';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

export type KkGreaseMarkKind = 'circle' | 'cross';

const CIRCLE_PATH =
  'M76 18 C58 4 20 8 12 40 C5 70 32 94 62 88 C90 82 96 50 84 28 C80 21 72 16 63 16';
const CROSS_PATHS = ['M14 12 C40 40 62 62 88 90', 'M86 10 C62 36 40 60 12 88'] as const;
const MILLISECONDS = 1000;
const STROKE_SCALE: Record<KkGreaseMarkKind, number> = { circle: 2.2, cross: 3 };

const { grease } = kkTokens.gallery;

const inkOf: Record<KkGreaseMarkKind, string> = {
  circle: 'warning.main',
  cross: 'primary.main',
};

interface KkGreaseMarkProps {
  kind: KkGreaseMarkKind;
  delaySeconds?: number;
  sx?: KkSx;
}

export const KkGreaseMark: FC<KkGreaseMarkProps> = ({ kind, delaySeconds = 0, sx }) => {
  const reducedMotion = useReducedMotion();
  const paths = kind === 'circle' ? [CIRCLE_PATH] : CROSS_PATHS;
  const strokeSeconds = (kind === 'circle' ? grease.circleMs : grease.crossMs) / MILLISECONDS;
  const initial = reducedMotion ? { pathLength: 1 } : { pathLength: 0 };
  const strokeWidth = grease.stroke * STROKE_SCALE[kind];
  const transitionAt = (order: number): Transition => ({
    duration: strokeSeconds,
    delay: delaySeconds + order * strokeSeconds,
    ease: 'easeOut',
  });
  const strokes = paths.map((path, order) => (
    <motion.path
      key={path}
      d={path}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      initial={initial}
      animate={{ pathLength: 1 }}
      transition={transitionAt(order)}
    />
  ));

  return (
    <Box
      component="svg"
      viewBox="0 0 100 100"
      aria-hidden
      data-kk-grease-mark={kind}
      sx={[
        { display: 'block', color: inkOf[kind], overflow: 'visible', pointerEvents: 'none' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {strokes}
    </Box>
  );
};
