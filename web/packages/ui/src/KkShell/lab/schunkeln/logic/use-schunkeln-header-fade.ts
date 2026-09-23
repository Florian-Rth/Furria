import type { MotionValue } from 'motion/react';
import { useScroll, useTransform } from 'motion/react';
import { kkTokens } from '../../../../tokens';
import { handoverProgressAt, headerLeaveAt } from './schunkel-pose';

const { scrollTravel, headerDrift } = kkTokens.shell;

export interface SchunkelnHeaderFade {
  opacity: MotionValue<number>;
  drift: MotionValue<number>;
}

const leaveAt = (scrollOffset: number): number =>
  headerLeaveAt(handoverProgressAt(scrollOffset, scrollTravel));

const opacityAt = (scrollOffset: number): number => 1 - leaveAt(scrollOffset);

const driftAt = (scrollOffset: number): number => -headerDrift * leaveAt(scrollOffset);

export const useSchunkelnHeaderFade = (): SchunkelnHeaderFade => {
  const { scrollY } = useScroll();

  return {
    opacity: useTransform(scrollY, opacityAt),
    drift: useTransform(scrollY, driftAt),
  };
};
