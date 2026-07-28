import type { TargetAndTransition, Transition } from 'motion/react';
import type { PhotoOrientation } from '@/features/gallery/gallery-content';

export interface PhotoStackFrameSpec {
  label: string;
  orientation: PhotoOrientation;
  leftPercent: number;
  topPercent: number;
  widthPercent: number;
  rotation: number;
  depth: number;
}

export const leadPhotoStackFrame: PhotoStackFrameSpec = {
  label: 'foto-01',
  orientation: 'landscape',
  leftPercent: 6,
  topPercent: 30,
  widthPercent: 66,
  rotation: -6,
  depth: 3,
};

export const fannedPhotoStackFrames: PhotoStackFrameSpec[] = [
  {
    label: 'foto-02',
    orientation: 'portrait',
    leftPercent: 30,
    topPercent: 2,
    widthPercent: 52,
    rotation: 8,
    depth: 1,
  },
  {
    label: 'foto-03',
    orientation: 'landscape',
    leftPercent: 4,
    topPercent: 4,
    widthPercent: 58,
    rotation: -13,
    depth: 2,
  },
];

export interface PhotoStackEntrance {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  transition: Transition;
}

const ENTRANCE_STEP_SECONDS = 0.09;

export const resolvePhotoStackEntrance = (
  spec: PhotoStackFrameSpec,
  reducedMotion: boolean | null,
): PhotoStackEntrance => {
  const settled: TargetAndTransition = { opacity: 1, rotate: spec.rotation, y: 0 };

  if (reducedMotion === true) {
    return { initial: settled, animate: settled, transition: { duration: 0 } };
  }

  return {
    initial: { opacity: 0, rotate: 0, y: 18 },
    animate: settled,
    transition: {
      duration: 0.5,
      delay: (spec.depth - 1) * ENTRANCE_STEP_SECONDS,
      ease: 'easeOut',
    },
  };
};
