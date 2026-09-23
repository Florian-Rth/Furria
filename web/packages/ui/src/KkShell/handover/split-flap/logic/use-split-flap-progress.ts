import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import { useReducedMotion } from '../../../../internal/use-reduced-motion';
import { useKkShellScroll } from '../../../internal/logic/shell-scroll';
import { boardProgressAt } from './split-flap-flaps';

export const useSplitFlapProgress = (): MotionValue<number> => {
  const { scrollY } = useKkShellScroll();
  const reduced = useReducedMotion();

  return useTransform(scrollY, (offset: number): number => boardProgressAt(offset, reduced));
};
