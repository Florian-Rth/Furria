import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import { kkTokens } from '../../../tokens';
import { useKkShellScroll } from '../../internal/logic/shell-scroll';
import { DOCK_TRAVEL, dockProgressAt, dockStageAt } from './dock-flight';

const { headerDrift } = kkTokens.shell;

const headlineOpacityAt = (scrollOffset: number): number =>
  dockStageAt(dockProgressAt(scrollOffset, DOCK_TRAVEL), true, headerDrift).realHeadlineOpacity;

export const useDockHeadline = (): MotionValue<number> => {
  const { scrollY } = useKkShellScroll();

  return useTransform(scrollY, headlineOpacityAt);
};
