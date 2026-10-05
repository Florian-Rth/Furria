import type { MotionValue } from 'motion/react';
import { useTransform } from 'motion/react';
import { coverClipOf, leafShadeOf, revealClipOf } from '../../../internal/flap/flap-pose';
import type { FlapTrack } from './flap-keyframes';
import { twinFaceAt, twinPoseOf } from './greeting-twin';

export interface FlapCellMotion {
  fall: MotionValue<number>;
  land: MotionValue<number>;
  presence: MotionValue<number>;
  revealClip: MotionValue<string>;
  coverClip: MotionValue<string>;
  fallShade: MotionValue<number>;
  landShade: MotionValue<number>;
  fromFace: MotionValue<string>;
  toFace: MotionValue<string>;
}

const RIGHT_ANGLE = 90;
const RESTING_LAND = 0;
const OPEN_COVER = 0;
const CURRENT = 0;
const NEXT = 1;

export const useFlapCellMotion = (
  clock: MotionValue<number>,
  track: FlapTrack,
  faces: readonly string[],
): FlapCellMotion => {
  const fall = useTransform(clock, track.at, track.fall);
  const land = useTransform(clock, track.at, track.land);
  const cover = useTransform(clock, track.at, track.cover);
  const presence = useTransform(clock, track.at, track.presence);
  const face = useTransform(clock, track.at, track.face);

  return {
    fall,
    land,
    presence,
    revealClip: useTransform(fall, (angle: number): string =>
      revealClipOf(twinPoseOf(angle, RIGHT_ANGLE, OPEN_COVER)),
    ),
    coverClip: useTransform(cover, (share: number): string =>
      coverClipOf(twinPoseOf(-RIGHT_ANGLE, RESTING_LAND, share)),
    ),
    fallShade: useTransform(fall, leafShadeOf),
    landShade: useTransform(land, leafShadeOf),
    fromFace: useTransform(face, (index: number): string => twinFaceAt(faces, index, CURRENT)),
    toFace: useTransform(face, (index: number): string => twinFaceAt(faces, index, NEXT)),
  };
};
