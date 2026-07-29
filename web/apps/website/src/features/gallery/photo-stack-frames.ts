import { kkTokens } from '@furria/ui';
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

const allPhotoStackFrames = [leadPhotoStackFrame, ...fannedPhotoStackFrames];

const resolveHeightPerWidth = (orientation: PhotoOrientation): number => {
  const [width, height] = kkTokens.aspectRatio[orientation].split('/');

  return Number(height) / Number(width);
};

export const resolveFrameHeightPercent = (spec: PhotoStackFrameSpec): number =>
  spec.widthPercent * resolveHeightPerWidth(spec.orientation);

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

export const resolveFannedPhotoStackFrames = (
  reducedMotion: boolean | null,
): AnimatedPhotoStackFrame[] =>
  fannedPhotoStackFrames.map((spec) => ({
    spec,
    entrance: resolvePhotoStackEntrance(spec, reducedMotion),
  }));
