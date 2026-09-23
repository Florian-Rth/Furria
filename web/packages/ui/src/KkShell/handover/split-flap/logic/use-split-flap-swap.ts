import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import type { RefObject } from 'react';
import { boardLeadOf } from './split-flap-flaps';
import type { SplitFlapGlint } from './use-split-flap-glint';
import { useSplitFlapGlint } from './use-split-flap-glint';
import type { SplitFlapGeometry } from './use-split-flap-measure';
import { useSplitFlapMeasure } from './use-split-flap-measure';
import { useSplitFlapProgress } from './use-split-flap-progress';

export interface SplitFlapSwap {
  stageRef: RefObject<HTMLDivElement | null>;
  restRef: RefObject<HTMLDivElement | null>;
  titleRef: RefObject<HTMLDivElement | null>;
  geometry: SplitFlapGeometry;
  lead: number;
  progress: MotionValue<number>;
  restOpacity: MotionValue<number>;
  titleOpacity: MotionValue<number>;
  boardOpacity: MotionValue<number>;
  glint: SplitFlapGlint;
}

const restOpacityAt = (progress: number): number => (progress <= 0 ? 1 : 0);
const titleOpacityAt = (progress: number): number => (progress >= 1 ? 1 : 0);
const boardOpacityAt = (progress: number): number => (progress > 0 && progress < 1 ? 1 : 0);

export const useSplitFlapSwap = (restText: string | null, titleText: string): SplitFlapSwap => {
  const { stageRef, restRef, titleRef, geometry } = useSplitFlapMeasure(restText, titleText);
  const progress = useSplitFlapProgress();
  const glint = useSplitFlapGlint(stageRef, progress);

  return {
    stageRef,
    restRef,
    titleRef,
    geometry,
    lead: boardLeadOf(restText),
    progress,
    restOpacity: useTransform(progress, restOpacityAt),
    titleOpacity: useTransform(progress, titleOpacityAt),
    boardOpacity: useTransform(progress, boardOpacityAt),
    glint,
  };
};
