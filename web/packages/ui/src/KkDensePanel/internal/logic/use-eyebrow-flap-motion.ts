import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import type { SplitFlapPose } from '../../../internal/flap/flap-pose';
import {
  coverClipOf,
  flapPoseAt,
  leafShadeOf,
  revealClipOf,
} from '../../../internal/flap/flap-pose';

export interface EyebrowFlapMotion {
  fall: MotionValue<number>;
  land: MotionValue<number>;
  fallOpacity: MotionValue<number>;
  landOpacity: MotionValue<number>;
  revealClip: MotionValue<string>;
  coverClip: MotionValue<string>;
  presence: MotionValue<number>;
  fallShade: MotionValue<number>;
  landShade: MotionValue<number>;
}

export const useEyebrowFlapMotion = (progress: MotionValue<number>): EyebrowFlapMotion => {
  const pose = useTransform(progress, flapPoseAt);

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
  };
};
