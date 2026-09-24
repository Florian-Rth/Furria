import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import { kkTokens } from '../../../tokens';
import { useKkShellScroll } from '../../internal/logic/shell-scroll';
import type { DockStage } from './dock-flight';
import { DOCK_TRAVEL, dockProgressAt, dockStageAt } from './dock-flight';

const { headerDrift } = kkTokens.shell;

export interface DockHeaderFade {
  opacity: MotionValue<number>;
  drift: MotionValue<number>;
  headlineOpacity: MotionValue<number>;
}

const stageAt = (scrollOffset: number): DockStage =>
  dockStageAt(dockProgressAt(scrollOffset, DOCK_TRAVEL), true, headerDrift);

const headerOpacityAt = (scrollOffset: number): number => stageAt(scrollOffset).headerOpacity;

const headerDriftAt = (scrollOffset: number): number => stageAt(scrollOffset).headerDrift;

const headlineOpacityAt = (scrollOffset: number): number =>
  stageAt(scrollOffset).realHeadlineOpacity;

export const useDockHeaderFade = (): DockHeaderFade => {
  const { scrollY } = useKkShellScroll();

  return {
    opacity: useTransform(scrollY, headerOpacityAt),
    drift: useTransform(scrollY, headerDriftAt),
    headlineOpacity: useTransform(scrollY, headlineOpacityAt),
  };
};
