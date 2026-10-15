import type { Easing, TargetAndTransition, Transition } from 'motion/react';

export type HonourMotion = 'still' | 'arrive' | 'strike' | 'forge';

export const PIECE_START_SECONDS = 0.12;
export const PIECE_STEP_SECONDS = 0.04;
export const GLINT_LEAD_SECONDS = 0.1;
export const FORGE_GLINT_SECONDS = 0.18;
export const SASH_DELAY_SECONDS = 0.5;
export const COIN_DELAY_SECONDS = 0.6;
export const COIN_STEP_SECONDS = 0.1;
export const STANDING_DELAY_SECONDS = 0.26;
export const STRIKE_LEAD_SECONDS = 0.38;
export const FORGE_LEAD_SECONDS = 0.82;

const SPRING_STRIKE: Easing = [0.3, 1.7, 0.5, 1];

export const strikeTransition = (delay: number): Transition => ({
  duration: 0.24,
  ease: SPRING_STRIKE,
  delay,
});

export const slamTransition: Transition = {
  duration: 0.42,
  times: [0, 0.6, 1],
  ease: [0.3, 2, 0.5, 1],
};

export const glintTransition = (delay: number): Transition => ({
  duration: 0.6,
  times: [0, 0.2, 0.8, 1],
  ease: 'easeInOut',
  delay,
});

export const sashTransition: Transition = {
  duration: 0.5,
  ease: [0.2, 1.2, 0.4, 1],
  delay: SASH_DELAY_SECONDS,
};

export const coinTransition = (order: number): Transition => ({
  duration: 0.32,
  ease: [0.3, 1.8, 0.5, 1],
  delay: COIN_DELAY_SECONDS + order * COIN_STEP_SECONDS,
});

export const standingTransition: Transition = {
  duration: 0.42,
  ease: 'easeOut',
  delay: STANDING_DELAY_SECONDS,
};

export const bandTransition: Transition = { duration: 0.3, ease: 'easeOut' };

export const dipTransition: Transition = {
  duration: 0.56,
  times: [0, 0.35, 0.7, 1],
  ease: [0.3, 1.4, 0.5, 1],
};

export const chipTransition = (delay: number): Transition => ({
  duration: 1,
  ease: [0.2, 0.7, 0.3, 1],
  delay,
  opacity: { duration: 1, times: [0, 0.1, 1], ease: 'linear', delay },
});

export const pieceDelayOf = (order: number): number =>
  Number((PIECE_START_SECONDS + order * PIECE_STEP_SECONDS).toFixed(3));

export const glintDelayOf = (struck: number): number =>
  pieceDelayOf(Math.max(struck - 1, 0)) + GLINT_LEAD_SECONDS;

export type PieceMotion = 'still' | 'strike' | 'slam' | 'fade';

export interface PieceCue {
  motion: PieceMotion;
  delay: number;
}

const STILL: PieceCue = { motion: 'still', delay: 0 };

export const pieceCueOf = (
  motion: HonourMotion,
  order: number,
  struck: number,
  isMetal: boolean,
  isBand: boolean,
): PieceCue => {
  if (!isMetal) {
    return STILL;
  }
  if (motion === 'arrive') {
    return { motion: 'strike', delay: pieceDelayOf(order) };
  }
  if (motion === 'strike' && order === struck - 1) {
    return { motion: 'slam', delay: 0 };
  }
  if (motion === 'forge' && isBand) {
    return { motion: 'fade', delay: 0 };
  }

  return STILL;
};

export const glintCueOf = (motion: HonourMotion, struck: number): number | null => {
  switch (motion) {
    case 'arrive':
      return glintDelayOf(struck);
    case 'forge':
      return FORGE_GLINT_SECONDS;
    default:
      return null;
  }
};

export interface MotionStaging {
  initial: TargetAndTransition | false;
  animate: TargetAndTransition;
  transition: Transition;
}

const INSTANT: Transition = { duration: 0 };

export const settledAt = (target: TargetAndTransition): MotionStaging => ({
  initial: false,
  animate: target,
  transition: INSTANT,
});

const STRUCK = { opacity: 1, scale: 1 } as const;
const PIECE_SETTLED = settledAt(STRUCK);

export const pieceStagingOf = (cue: PieceCue): MotionStaging => {
  switch (cue.motion) {
    case 'still':
      return PIECE_SETTLED;
    case 'strike':
      return {
        initial: { opacity: 0, scale: 0.5 },
        animate: STRUCK,
        transition: strikeTransition(cue.delay),
      };
    case 'slam':
      return {
        initial: { opacity: 0, scale: 0.3 },
        animate: { opacity: [0, 1, 1], scale: [0.3, 1.35, 1] },
        transition: slamTransition,
      };
    case 'fade':
      return {
        initial: { opacity: 0, scale: 1 },
        animate: STRUCK,
        transition: bandTransition,
      };
  }
};

export const FILL_BOX_ORIGIN = { transformBox: 'fill-box', transformOrigin: '50% 50%' } as const;

export const VIEW_BOX_ORIGIN = { transformBox: 'view-box', transformOrigin: '50% 50%' } as const;

export const dipStagingOf = (motion: HonourMotion): MotionStaging =>
  motion === 'forge'
    ? { initial: { scale: 1 }, animate: { scale: [1, 0.92, 1.05, 1] }, transition: dipTransition }
    : settledAt({ scale: 1 });

export type ClosingPhase = 'before' | 'strike' | 'forged';

export const closingPlayOf = (phase: ClosingPhase, reduced: boolean): HonourMotion => {
  if (reduced) {
    return 'still';
  }

  switch (phase) {
    case 'before':
      return 'still';
    case 'strike':
      return 'strike';
    case 'forged':
      return 'forge';
  }
};
