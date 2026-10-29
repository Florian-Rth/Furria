import type { Transition } from 'motion/react';

export const HANDOVER: Transition = { type: 'spring', stiffness: 260, damping: 32, mass: 1 };

export const ROW_ENTER = { opacity: 0 } as const;
export const ROW_REST = { opacity: 1 } as const;
export const ROW_LEAVE = { opacity: 0, transition: { duration: 0.12 } } as const;
export const ROW_FADE: Transition = {
  duration: 0.32,
  delay: 0.08,
  ease: 'easeOut',
  layout: HANDOVER,
};

export const CURRENT_MARK_ID = 'kk-studio-b-current';
