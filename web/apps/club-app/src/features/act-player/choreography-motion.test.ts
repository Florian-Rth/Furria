import { describe, expect, it } from 'vitest';
import type { Choreography } from '@/features/acts/schemas';
import type { SpotPath, TimedKeyframe } from './choreography-motion';
import {
  easedProgress,
  facingOnMove,
  pointOnMove,
  poseAt,
  spotPathsOf,
} from './choreography-motion';
import type { MusicSegment } from './music-timeline';

const segment: MusicSegment = {
  mediaItemId: 1,
  audioUrl: '/a',
  peaksUrl: '/k',
  audible: true,
  sourceStart: 10,
  sourceEnd: 30,
  timelineStart: 0,
  timelineEnd: 20,
  beats: [],
};

const at = (rightMetres: number, backMetres: number) => ({ rightMetres, backMetres });

const keyframe = (seconds: number, patch: Partial<TimedKeyframe> = {}): TimedKeyframe => ({
  seconds,
  position: at(0, 0),
  bend: null,
  easing: 'linear',
  facingDegrees: null,
  ...patch,
});

describe('spotPathsOf', () => {
  it('places the keyframes on the music in time order and leaves out what was cut away', () => {
    const choreography: Choreography = {
      version: 1,
      tracks: [
        {
          spotId: 4,
          keyframes: [16, 12, 40].map((seconds) => ({
            sourceMediaItemId: 1,
            seconds,
            position: at(0, 1),
            bend: null,
            easing: 'linear' as const,
            facingDegrees: null,
          })),
        },
      ],
    };

    const [path] = spotPathsOf(choreography, [segment]);

    expect(path?.keyframes.map((placed) => placed.seconds)).toEqual([2, 6]);
  });
});

describe('easedProgress', () => {
  it.each([
    ['linear', 0.25, 0.25],
    ['easeIn', 0.5, 0.25],
    ['easeOut', 0.5, 0.75],
    ['easeInOut', 0.25, 0.125],
    ['easeInOut', 0.75, 0.875],
    ['linear', 1.5, 1],
  ] as const)('eases %s at %s to %s', (easing, progress, expected) => {
    expect(easedProgress(easing, progress)).toBeCloseTo(expected);
  });
});

describe('pointOnMove', () => {
  it('walks straight without a bend', () => {
    expect(pointOnMove(at(0, 0), at(4, 2), null, 0.25)).toEqual(at(1, 0.5));
  });

  it('passes through the bend half way', () => {
    const middle = pointOnMove(at(0, 0), at(4, 0), at(2, 3), 0.5);

    expect([middle.rightMetres, middle.backMetres]).toEqual([2, 3]);
  });
});

describe('facingOnMove', () => {
  it.each([
    [350, 10, 0.5, 0],
    [10, 350, 0.25, 5],
    [90, 270, 0.5, 0],
    [null, 90, 0.5, null],
    [null, 90, 1, 90],
  ])('turns from %s to %s at %s by the short way to %s', (from, to, progress, expected) => {
    expect(facingOnMove(from, to, progress)).toBe(expected);
  });
});

describe('poseAt', () => {
  const path: SpotPath = {
    spotId: 3,
    keyframes: [
      keyframe(2, { position: at(-2, 1) }),
      keyframe(4, { position: at(-2, 1) }),
      keyframe(8, { position: at(2, 3) }),
    ],
  };

  it.each([
    [0, at(-2, 1), false],
    [3, at(-2, 1), false],
    [6, at(0, 2), true],
    [9, at(2, 3), false],
  ])('stands at %s seconds on %o, moving %s', (seconds, position, moving) => {
    const pose = poseAt(path, seconds);

    expect([pose?.position, pose?.moving]).toEqual([position, moving]);
  });

  it('has no pose without keyframes', () => {
    expect(poseAt({ spotId: 1, keyframes: [] }, 3)).toBeNull();
  });
});
