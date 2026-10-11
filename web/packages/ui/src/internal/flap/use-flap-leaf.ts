import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import type { FlapLeafFrame, FlapPoseAt } from './flap-pose';
import { flapLeafOf, flapPoseAt } from './flap-pose';

export interface FlapLeafMotion {
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

export const useFlapLeaf = (
  clock: MotionValue<number>,
  poseAt: FlapPoseAt = flapPoseAt,
): FlapLeafMotion => {
  const leaf = useTransform(clock, (at: number): FlapLeafFrame => flapLeafOf(poseAt(at)));

  return {
    fall: useTransform(leaf, (frame: FlapLeafFrame): number => frame.fall),
    land: useTransform(leaf, (frame: FlapLeafFrame): number => frame.land),
    fallOpacity: useTransform(leaf, (frame: FlapLeafFrame): number => frame.fallOpacity),
    landOpacity: useTransform(leaf, (frame: FlapLeafFrame): number => frame.landOpacity),
    revealClip: useTransform(leaf, (frame: FlapLeafFrame): string => frame.revealClip),
    coverClip: useTransform(leaf, (frame: FlapLeafFrame): string => frame.coverClip),
    presence: useTransform(leaf, (frame: FlapLeafFrame): number => frame.presence),
    fallShade: useTransform(leaf, (frame: FlapLeafFrame): number => frame.fallShade),
    landShade: useTransform(leaf, (frame: FlapLeafFrame): number => frame.landShade),
  };
};
