import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import { handoverAt } from './handover';
import { useKkShellScroll } from './shell-scroll';

export interface KkBarSwapMotion {
  restOpacity: MotionValue<number>;
  titleOpacity: MotionValue<number>;
  titleRise: MotionValue<number>;
}

export const useBarSwapMotion = (): KkBarSwapMotion => {
  const { scrollY, motion } = useKkShellScroll();

  const restOpacityAt = (scrollOffset: number): number =>
    handoverAt(scrollOffset, motion).restOpacity;
  const titleOpacityAt = (scrollOffset: number): number =>
    handoverAt(scrollOffset, motion).titleOpacity;
  const titleRiseAt = (scrollOffset: number): number => handoverAt(scrollOffset, motion).titleRise;

  return {
    restOpacity: useTransform(scrollY, restOpacityAt),
    titleOpacity: useTransform(scrollY, titleOpacityAt),
    titleRise: useTransform(scrollY, titleRiseAt),
  };
};
