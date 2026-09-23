import type { MotionValue } from 'motion/react';
import { useScroll, useTransform } from 'motion/react';
import { useReducedMotion } from '../../../../internal/use-reduced-motion';
import { boardProgressAt } from './fallblatt-flaps';

export const useFallblattProgress = (): MotionValue<number> => {
  const { scrollY } = useScroll();
  const reduced = useReducedMotion();

  return useTransform(scrollY, (offset: number): number => boardProgressAt(offset, reduced));
};
