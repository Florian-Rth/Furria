import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import type { FallblattCell, FallblattPose, FallblattWindow } from './fallblatt-flaps';
import { cellOffsetAt, flapPoseAt, ramp } from './fallblatt-flaps';

export interface FallblattFlapMotion {
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

const HALF = 50;
const SPILL = '-40%';
const SHADE_DEPTH = 0.4;

export const TOP_HALF_CLIP = `inset(${SPILL} ${SPILL} ${HALF}% ${SPILL})`;
export const BOTTOM_HALF_CLIP = `inset(${HALF}% ${SPILL} ${SPILL} ${SPILL})`;

const revealClipOf = (pose: FallblattPose): string =>
  `inset(${SPILL} ${SPILL} ${HALF + HALF * (1 - pose.reveal)}% ${SPILL})`;

const coverClipOf = (pose: FallblattPose): string =>
  `inset(${HALF + HALF * pose.cover}% ${SPILL} ${SPILL} ${SPILL})`;

const shadeOf = (degrees: number): number =>
  SHADE_DEPTH * (1 - Math.cos((degrees * Math.PI) / 180));

export const useFallblattFlapMotion = (
  progress: MotionValue<number>,
  window: FallblattWindow,
  cell: FallblattCell,
): FallblattFlapMotion => {
  const flipped = useTransform(progress, (value: number): number =>
    ramp(value, window.start, window.end),
  );
  const pose = useTransform(flipped, flapPoseAt);

  return {
    fall: useTransform(pose, (value: FallblattPose): number => value.fall),
    land: useTransform(pose, (value: FallblattPose): number => value.land),
    fallOpacity: useTransform(pose, (value: FallblattPose): number => (value.fallen ? 0 : 1)),
    landOpacity: useTransform(pose, (value: FallblattPose): number => (value.fallen ? 1 : 0)),
    revealClip: useTransform(pose, revealClipOf),
    coverClip: useTransform(pose, coverClipOf),
    presence: useTransform(pose, (value: FallblattPose): number => value.presence),
    fallShade: useTransform(pose, (value: FallblattPose): number => shadeOf(value.fall)),
    landShade: useTransform(pose, (value: FallblattPose): number => shadeOf(value.land)),
    offset: useTransform(flipped, (value: number): number => cellOffsetAt(cell, value)),
  };
};
