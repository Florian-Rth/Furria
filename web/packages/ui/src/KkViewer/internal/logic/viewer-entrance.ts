import type { TargetAndTransition, Transition } from 'motion/react';
import { kkTokens } from '../../../tokens';
import type { KkViewerEntrance } from '../../viewer-types';

const { loupe } = kkTokens.gallery;
const IRIS_EASE = [0.2, 0.8, 0.2, 1] as const;
const MILLISECONDS = 1000;

export interface ViewerEntrance {
  timeout: { enter: number; exit: number } | undefined;
  initial: TargetAndTransition | false;
  opened: TargetAndTransition;
  transition: Transition;
}

const STILL: ViewerEntrance = {
  timeout: undefined,
  initial: false,
  opened: {},
  transition: {},
};

const IRIS: ViewerEntrance = {
  timeout: { enter: 0, exit: loupe.closeSeconds * MILLISECONDS },
  initial: { opacity: 0, clipPath: 'circle(8% at 50% 46%)', scale: 0.96 },
  opened: { opacity: 1, clipPath: 'circle(120% at 50% 46%)', scale: 1 },
  transition: { duration: loupe.openSeconds, ease: IRIS_EASE },
};

const INSTANT: ViewerEntrance = { ...STILL, timeout: { enter: 0, exit: 0 } };

export const viewerEntranceOf = (
  entrance: KkViewerEntrance,
  reducedMotion: boolean,
): ViewerEntrance => {
  if (reducedMotion) {
    return INSTANT;
  }
  return entrance === 'iris' ? IRIS : STILL;
};
