import type { Transition } from 'motion/react';

const LAYOUT_GLIDE: Transition = { type: 'spring', stiffness: 420, damping: 38, mass: 0.9 };
const ARRIVE: Transition = { duration: 0.22, ease: 'easeOut' };

export const kkMotion = {
  layoutGlide: LAYOUT_GLIDE,
  arrive: ARRIVE,
} as const;
