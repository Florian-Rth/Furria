import type { Transition } from 'motion/react';

const STEP_DURATION_S = 0.24;

export const resolveStepTransition = (reducedMotion: boolean | null): Transition =>
  reducedMotion === true ? { duration: 0 } : { duration: STEP_DURATION_S, ease: 'easeOut' };
