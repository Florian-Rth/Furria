import type { Transition } from 'motion/react';

export const PROMO_RISE: Transition = { type: 'spring', stiffness: 230, damping: 21, mass: 1 };
export const PROMO_SLAM: Transition = { type: 'spring', stiffness: 520, damping: 17, mass: 1.1 };
export const PROMO_FLIGHT: Transition = { type: 'spring', stiffness: 95, damping: 15, mass: 1.2 };
export const PROMO_SETTLE: Transition = { type: 'spring', stiffness: 160, damping: 24 };
export const PROMO_GLIDE: Transition = { type: 'spring', duration: 1.1, bounce: 0 };
export const PROMO_LINE_STAGGER = 0.11;
