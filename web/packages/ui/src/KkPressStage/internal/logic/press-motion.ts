import type { Theme } from '@mui/material/styles';
import type { TargetAndTransition, Transition } from 'motion/react';
import type { KkConfettiColor } from '../../../confetti-pieces';
import type { KkPressPhase } from '../../press-beats';
import { KK_PRESS_BEATS_MS } from '../../press-beats';

const SECONDS = 1000;

export const PRESS_CONFETTI: readonly KkConfettiColor[] = ['red', 'gold'];

export type PlateInk = 'ink' | 'red' | 'gold';

export interface PlateSpec {
  ink: PlateInk;
  dx: number;
  dy: number;
}

export const PLATES: readonly PlateSpec[] = [
  { ink: 'gold', dx: -5, dy: -7 },
  { ink: 'red', dx: 7, dy: -4 },
  { ink: 'ink', dx: -6, dy: 5 },
];

const PLATE_TRAVEL = 3;
const SLIP_TRAVEL = 2.2;
const LOOSE_RATIO = 0.35;

export const plateInkOf = (theme: Theme, ink: PlateInk): string => {
  const palette = (theme.vars ?? theme).palette;
  const inks: Record<PlateInk, string> = {
    ink: palette.text.primary,
    red: palette.primary.main,
    gold: palette.warning.main,
  };
  return inks[ink];
};

export const plateStartOf = (plate: PlateSpec): TargetAndTransition => ({
  x: plate.dx * PLATE_TRAVEL,
  y: plate.dy * PLATE_TRAVEL,
  opacity: 0,
});

export const plateTargetOf = (
  plate: PlateSpec,
  phase: KkPressPhase,
  failed: boolean,
): TargetAndTransition => {
  if (failed) {
    return {
      x: plate.dx * SLIP_TRAVEL,
      y: plate.dy * SLIP_TRAVEL,
      opacity: 0.9,
      transition: { duration: KK_PRESS_BEATS_MS.slip / SECONDS, ease: 'easeIn' },
    };
  }
  if (phase === 'register') {
    return {
      x: plate.dx * LOOSE_RATIO,
      y: plate.dy * LOOSE_RATIO,
      opacity: 1,
      transition: { type: 'spring', stiffness: 260, damping: 18 },
    };
  }
  if (phase === 'strike') {
    return {
      x: 0,
      y: 0,
      opacity: 0,
      transition: {
        x: { duration: KK_PRESS_BEATS_MS.strike / SECONDS, ease: 'easeIn' },
        y: { duration: KK_PRESS_BEATS_MS.strike / SECONDS, ease: 'easeIn' },
        opacity: { delay: 0.3, duration: 0.6 },
      },
    };
  }
  return { x: 0, y: 0, opacity: 0, transition: { duration: 0.2 } };
};

export const WOBBLE: TargetAndTransition = {
  x: [0, 1.4, -1, 0.6, 0],
  y: [0, -0.8, 1.2, -0.4, 0],
  transition: { duration: 0.9, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' },
};

export const STILL: TargetAndTransition = { x: 0, y: 0, transition: { duration: 0.12 } };

export const sheetMotionOf = (phase: KkPressPhase, failed: boolean): TargetAndTransition => {
  if (failed) {
    return { x: [0, -5, 5, -4, 4, -2, 0], scale: 1, transition: { duration: 0.42 } };
  }
  if (phase === 'strike') {
    return {
      x: 0,
      scale: [1, 0.985, 1],
      transition: { duration: 0.32, times: [0, 0.35, 1], ease: 'easeOut' },
    };
  }
  return { x: 0, scale: 1 };
};

export const ROLL_EASE: Transition['ease'] = [0.45, 0.05, 0.3, 1];

export const ROLL_TRANSITION: Transition = {
  delay: KK_PRESS_BEATS_MS.strike / SECONDS,
  duration: KK_PRESS_BEATS_MS.inkRoll / SECONDS,
  ease: ROLL_EASE,
};

export const STAMP_SLAM: TargetAndTransition = {
  scale: 1,
  opacity: 1,
  y: 0,
  rotate: -5,
  transition: { type: 'spring', stiffness: 520, damping: 17, mass: 0.9 },
};

export const STAMP_LIFTED: TargetAndTransition = { scale: 1.7, opacity: 0, y: 0, rotate: -12 };

export const STAMP_LEAVING: TargetAndTransition = {
  scale: 0.94,
  opacity: 0,
  y: -24,
  rotate: -5,
  transition: { duration: 0.45, ease: 'easeIn' },
};
