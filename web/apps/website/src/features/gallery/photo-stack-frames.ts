import type { KkAspect } from '@furria/ui/image-aspect';
import { aspectOf } from '@furria/ui/image-aspect';
import { WEBSITE_PICTURE_SLOTS } from '@furria/website-pictures';
import type { TargetAndTransition, Transition } from 'motion/react';

const STACK_POSITIONS = WEBSITE_PICTURE_SLOTS['gallery.stack'].positions;

export interface PhotoStackFrameSpec {
  position: number;
  aspect: KkAspect;
  leftPercent: number;
  topPercent: number;
  widthPercent: number;
  rotation: number;
  depth: number;
}

export const leadPhotoStackFrame: PhotoStackFrameSpec = {
  position: 1,
  aspect: STACK_POSITIONS[0],
  leftPercent: 6,
  topPercent: 30,
  widthPercent: 66,
  rotation: -6,
  depth: 3,
};

export const fannedPhotoStackFrames: PhotoStackFrameSpec[] = [
  {
    position: 2,
    aspect: STACK_POSITIONS[1],
    leftPercent: 30,
    topPercent: 2,
    widthPercent: 52,
    rotation: 8,
    depth: 1,
  },
  {
    position: 3,
    aspect: STACK_POSITIONS[2],
    leftPercent: 4,
    topPercent: 4,
    widthPercent: 58,
    rotation: -13,
    depth: 2,
  },
];

const allPhotoStackFrames = [leadPhotoStackFrame, ...fannedPhotoStackFrames];

export const resolveFrameHeightPercent = (spec: PhotoStackFrameSpec): number =>
  spec.widthPercent / aspectOf(spec.aspect);

export const resolveFrameBottomPercent = (spec: PhotoStackFrameSpec): number =>
  spec.topPercent + resolveFrameHeightPercent(spec);

export const photoStackHeightPercent = Math.max(
  ...allPhotoStackFrames.map(resolveFrameBottomPercent),
);

export const photoStackAspectRatio = `100 / ${photoStackHeightPercent}`;

export interface PhotoStackEntrance {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  transition: Transition;
}

const ENTRANCE_STEP_SECONDS = 0.09;

export interface AnimatedPhotoStackFrame {
  spec: PhotoStackFrameSpec;
  entrance: PhotoStackEntrance;
}

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

export interface ShownPhotoStackFrames {
  lead: AnimatedPhotoStackFrame | null;
  fanned: AnimatedPhotoStackFrame[];
}

const animatedFrameOf = (
  spec: PhotoStackFrameSpec,
  reducedMotion: boolean | null,
): AnimatedPhotoStackFrame => ({ spec, entrance: resolvePhotoStackEntrance(spec, reducedMotion) });

export const resolveShownPhotoStackFrames = (
  positions: readonly number[],
  reducedMotion: boolean | null,
): ShownPhotoStackFrames => ({
  lead: positions.includes(leadPhotoStackFrame.position)
    ? animatedFrameOf(leadPhotoStackFrame, reducedMotion)
    : null,
  fanned: fannedPhotoStackFrames
    .filter((spec) => positions.includes(spec.position))
    .map((spec) => animatedFrameOf(spec, reducedMotion)),
});
