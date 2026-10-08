import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import type { SplitFlapPose } from '../../../../internal/flap/flap-pose';
import {
  coverClipOf,
  flapPoseAt,
  leafShadeOf,
  revealClipOf,
} from '../../../../internal/flap/flap-pose';
import { ramp } from '../../../../internal/ramp';
import type { SplitFlapCell, SplitFlapWindow } from './split-flap-flaps';
import { cellOffsetAt } from './split-flap-flaps';

export interface SplitFlapFlapMotion {
  fall: MotionValue<number>;
  land: MotionValue<number>;
  fallOpacity: MotionValue<number>;
  landOpacity: MotionValue<number>;
  revealClip: MotionValue<string>;
  coverClip: MotionValue<string>;
  presence: MotionValue<number>;
  fallShade: MotionValue<number>;
  landShade: MotionValue<number>;
  offset: MotionValue<number>;
}

export const useSplitFlapFlapMotion = (
  progress: MotionValue<number>,
  window: SplitFlapWindow,
  cell: SplitFlapCell,
): SplitFlapFlapMotion => {
  const flipped = useTransform(progress, (value: number): number =>
    ramp(value, window.start, window.end),
  );
  const pose = useTransform(flipped, flapPoseAt);

  return {
    fall: useTransform(pose, (value: SplitFlapPose): number => value.fall),
    land: useTransform(pose, (value: SplitFlapPose): number => value.land),
    fallOpacity: useTransform(pose, (value: SplitFlapPose): number => (value.fallen ? 0 : 1)),
    landOpacity: useTransform(pose, (value: SplitFlapPose): number => (value.fallen ? 1 : 0)),
    revealClip: useTransform(pose, revealClipOf),
    coverClip: useTransform(pose, coverClipOf),
    presence: useTransform(pose, (value: SplitFlapPose): number => value.presence),
    fallShade: useTransform(pose, (value: SplitFlapPose): number => leafShadeOf(value.fall)),
    landShade: useTransform(pose, (value: SplitFlapPose): number => leafShadeOf(value.land)),
    offset: useTransform(flipped, (value: number): number => cellOffsetAt(cell, value)),
  };
};
