import type { TargetAndTransition, Transition } from 'motion/react';
import { kkTokens } from '../../../tokens';

const { barSearch } = kkTokens.shell;

const EASE_OUT = [0.22, 0.61, 0.36, 1] as const;

export const BAR_GLASS_LAYOUT_ID = 'kk-shell-bar-glass';

export const GLASS_GLIDE: Transition = {
  duration: barSearch.sweepSeconds,
  ease: EASE_OUT,
};

export const FIELD_WAITING: TargetAndTransition = { opacity: 0, x: barSearch.shift };

export const FIELD_READY: TargetAndTransition = {
  opacity: 1,
  x: 0,
  transition: {
    duration: barSearch.sweepSeconds,
    ease: EASE_OUT,
    delay: barSearch.stepSeconds,
  },
};

export const RULE_CLOSED: TargetAndTransition = { scaleX: 0 };

export const RULE_DRAWN: TargetAndTransition = {
  scaleX: 1,
  transition: {
    duration: barSearch.sweepSeconds,
    ease: EASE_OUT,
    delay: barSearch.stepSeconds * 2,
  },
};

export const REST_WAITING: TargetAndTransition = { opacity: 0 };

export const REST_READY: TargetAndTransition = {
  opacity: 1,
  transition: { duration: barSearch.fadeSeconds, ease: 'easeOut' },
};
