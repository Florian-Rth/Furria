import type { ValueAnimationTransition } from 'motion/react';
import { animate } from 'motion/react';
import type { SchunkelLetterValues } from './schunkel-values';

export const DIP_MILLISECONDS = 250;
export const RIPPLE_MILLISECONDS = 20;

const SQUASH_KEYS = [1, 0.74, 1.05, 1];
const DIP: ValueAnimationTransition<number> = {
  duration: DIP_MILLISECONDS / 1000,
  times: [0, 0.42, 0.72, 1],
  ease: 'easeInOut',
};
const CASE_TURN: ValueAnimationTransition<number> = {
  duration: DIP_MILLISECONDS / 1000,
  times: [0, 0.4, 0.46, 1],
  ease: 'linear',
};

export const flipCase = (values: SchunkelLetterValues, lower: boolean, index: number): void => {
  const from = values.lower.get();
  const to = lower ? 1 : 0;
  const delay = (index * RIPPLE_MILLISECONDS) / 1000;

  void animate(values.squash, SQUASH_KEYS, { ...DIP, delay });
  void animate(values.lower, [from, from, to, to], { ...CASE_TURN, delay });
};
