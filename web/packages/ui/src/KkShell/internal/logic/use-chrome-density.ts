import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import { chromeDensityAt } from '../../../internal/chrome-density';
import { useKkShellScroll } from './shell-scroll';

export const useChromeDensity = (): MotionValue<number> => {
  const { scrollY, motion } = useKkShellScroll();

  return useTransform(scrollY, (scrollOffset: number): number =>
    chromeDensityAt(scrollOffset, motion),
  );
};
