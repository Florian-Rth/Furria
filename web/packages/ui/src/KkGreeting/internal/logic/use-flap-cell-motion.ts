import type { AnimationPlaybackControls, MotionValue } from 'motion/react';
import { animate, useMotionValue, useTransform } from 'motion/react';
import { useEffect, useEffectEvent } from 'react';
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

const MS_PER_SECOND = 1000;
const RIGHT_ANGLE = 90;
const RESTING_LAND = 0;
const OPEN_COVER = 0;
const CURRENT = 0;
const NEXT = 1;

const firstOf = (values: readonly number[], fallback: number): number => values[0] ?? fallback;

export const useFlapCellMotion = (track: FlapTrack, faces: readonly string[]): FlapCellMotion => {
  const fall = useMotionValue(firstOf(track.fall, 0));
  const land = useMotionValue(firstOf(track.land, RIGHT_ANGLE));
  const cover = useMotionValue(firstOf(track.cover, OPEN_COVER));
  const presence = useMotionValue(firstOf(track.presence, 0));
  const face = useMotionValue(firstOf(track.face, 0));

  const play = useEffectEvent((): (() => void) => {
    const timing = {
      duration: track.duration / MS_PER_SECOND,
      times: track.times,
      ease: 'linear' as const,
    };
    let controls: AnimationPlaybackControls[] = [];

    const timer = window.setTimeout(() => {
      controls = [
        animate(fall, track.fall, timing),
        animate(land, track.land, timing),
        animate(cover, track.cover, timing),
        animate(presence, track.presence, timing),
        animate(face, track.face, timing),
      ];
    }, track.delay);

    return () => {
      window.clearTimeout(timer);

      for (const control of controls) {
        control.stop();
      }
    };
  });

  useEffect(() => play(), []);

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
