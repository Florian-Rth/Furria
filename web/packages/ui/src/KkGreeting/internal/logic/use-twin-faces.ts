import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import type { FlapTrack } from './flap-keyframes';
import { twinFaceAt } from './greeting-twin';

export interface TwinFaces {
  fromFace: MotionValue<string>;
  toFace: MotionValue<string>;
}

const CURRENT = 0;
const NEXT = 1;

export const useTwinFaces = (
  clock: MotionValue<number>,
  track: FlapTrack,
  faces: readonly string[],
): TwinFaces => {
  const face = useTransform(clock, track.at, track.face);

  return {
    fromFace: useTransform(face, (index: number): string => twinFaceAt(faces, index, CURRENT)),
    toFace: useTransform(face, (index: number): string => twinFaceAt(faces, index, NEXT)),
  };
};
