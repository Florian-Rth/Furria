import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import { kkTokens } from '../../../../tokens';
import { useKkShellScroll } from '../../../internal/logic/shell-scroll';
import { handoverProgressAt, headerLeaveAt } from './sway-pose';

const { scrollTravel, headerDrift } = kkTokens.shell;

export interface SwayHeaderFade {
  opacity: MotionValue<number>;
  drift: MotionValue<number>;
}

const leaveAt = (scrollOffset: number): number =>
  headerLeaveAt(handoverProgressAt(scrollOffset, scrollTravel));

const opacityAt = (scrollOffset: number): number => 1 - leaveAt(scrollOffset);

const driftAt = (scrollOffset: number): number => -headerDrift * leaveAt(scrollOffset);

export const useSwayHeaderFade = (): SwayHeaderFade => {
  const { scrollY } = useKkShellScroll();

  return {
    opacity: useTransform(scrollY, opacityAt),
    drift: useTransform(scrollY, driftAt),
  };
};
