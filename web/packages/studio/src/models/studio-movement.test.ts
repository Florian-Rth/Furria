import type { TimedKeyframe } from '@furria/studio/choreography-motion';
import {
  bendHandleOf,
  bentMoveOf,
  easedMoveOf,
  facedMoveOf,
  keyedTrackOf,
  keyIndexAt,
  moveIndexNear,
  stagePointOfShare,
  turnedOf,
  unkeyedTrackOf,
} from '@furria/studio/studio-movement';
import { describe, expect, it } from 'vitest';

const key = (seconds: number, right: number, back = 0): TimedKeyframe => ({
  seconds,
  position: { rightMetres: right, backMetres: back },
  bend: null,
  easing: 'linear',
  facingDegrees: null,
});

const timesOf = (keyframes: readonly TimedKeyframe[]): number[] =>
  keyframes.map((keyframe) => keyframe.seconds);

const placesOf = (keyframes: readonly TimedKeyframe[]): number[] =>
  keyframes.map((keyframe) => keyframe.position.rightMetres);

const stage = { widthMetres: 10, depthMetres: 8 };

describe('moveIndexNear', () => {
  const track = [key(0, 0), key(2, 1), key(4, 1), key(6, 2), key(10, 2)];

  it.each([
    [0, 0],
    [3, 2],
    [9, 2],
  ])('picks the move a playhead at %s belongs to', (seconds, index) => {
    expect(moveIndexNear(track, { start: 0, end: 10 }, seconds)).toBe(index);
  });

  it('finds no move in a still step', () => {
    expect(moveIndexNear(track, { start: 6.5, end: 10 }, 7)).toBeNull();
  });
});

describe('keyedTrackOf', () => {
  it('moves the keyframe already at that moment', () => {
    expect(
      placesOf(keyedTrackOf([key(0, 0), key(4, 2)], 4, { rightMetres: 3, backMetres: 0 })),
    ).toEqual([0, 3]);
  });

  it('moves the hold that follows the keyframe with it', () => {
    expect(
      placesOf(
        keyedTrackOf([key(0, 0), key(4, 2), key(6, 2), key(8, 5)], 4, {
          rightMetres: 3,
          backMetres: 0,
        }),
      ),
    ).toEqual([0, 3, 3, 5]);
  });

  it('adds a waypoint and straightens the move it splits', () => {
    const bent = {
      ...key(4, 2),
      bend: { rightMetres: 1, backMetres: 2 },
      easing: 'easeIn' as const,
    };
    const keyed = keyedTrackOf([key(0, 0), bent], 2, { rightMetres: -1, backMetres: 1 });

    expect(timesOf(keyed)).toEqual([0, 2, 4]);
    expect(keyed[1]?.easing).toBe('easeIn');
    expect(keyed[2]?.bend).toBeNull();
  });

  it('places a spot without keyframes', () => {
    expect(timesOf(keyedTrackOf([], 3, { rightMetres: 0, backMetres: 1 }))).toEqual([3]);
  });

  it('takes the facing the spot has at that moment', () => {
    const keyed = keyedTrackOf(
      [
        { ...key(0, 0), facingDegrees: 0 },
        { ...key(4, 4), facingDegrees: 90 },
      ],
      2,
      { rightMetres: 1, backMetres: 0 },
    );

    expect(keyed[1]?.facingDegrees).toBe(45);
  });
});

describe('unkeyedTrackOf', () => {
  it('removes the waypoint and straightens the joined move', () => {
    const bent = { ...key(4, 2), bend: { rightMetres: 1, backMetres: 2 } };
    const unkeyed = unkeyedTrackOf([key(0, 0), key(2, 1), bent], 1);

    expect(timesOf(unkeyed)).toEqual([0, 4]);
    expect(unkeyed[1]?.bend).toBeNull();
  });

  it('keeps the last keyframe of a spot', () => {
    const track = [key(0, 0)];

    expect(unkeyedTrackOf(track, 0)).toBe(track);
  });
});

describe('keyIndexAt', () => {
  it.each([
    [2.01, 1],
    [2.5, null],
  ])('finds the keyframe near %s', (seconds, index) => {
    expect(keyIndexAt([key(0, 0), key(2, 1)], seconds, 0.02)).toBe(index);
  });
});

describe('bendHandleOf', () => {
  it.each([
    [null, { rightMetres: 2, backMetres: 1 }],
    [
      { rightMetres: 0, backMetres: 5 },
      { rightMetres: 0, backMetres: 5 },
    ],
  ])('puts the handle on the bend %o or half way', (bend, handle) => {
    expect(bendHandleOf([key(0, 0, 0), { ...key(4, 4, 2), bend }], 0)).toEqual(handle);
  });
});

describe('bentMoveOf', () => {
  const track = [key(0, 0, 0), key(4, 4, 2)];

  it('bends the move through the dragged point, kept on the stage', () => {
    expect(bentMoveOf(track, 0, { rightMetres: 9, backMetres: 3 }, stage)[1]?.bend).toEqual({
      rightMetres: 5,
      backMetres: 3,
    });
  });

  it('straightens a bend dragged back onto the middle', () => {
    expect(bentMoveOf(track, 0, { rightMetres: 2.05, backMetres: 1 }, stage)[1]?.bend).toBeNull();
  });
});

describe('easedMoveOf', () => {
  it('sets the easing on the arriving keyframe', () => {
    expect(easedMoveOf([key(0, 0), key(4, 4)], 0, 'easeInOut').map((k) => k.easing)).toEqual([
      'linear',
      'easeInOut',
    ]);
  });
});

describe('facedMoveOf', () => {
  it('turns the arrival and the hold after it', () => {
    const faced = facedMoveOf([key(0, 0), key(4, 4), key(6, 4), key(8, 1)], 0, 90);

    expect(faced.map((k) => k.facingDegrees)).toEqual([null, 90, 90, null]);
  });
});

describe('turnedOf', () => {
  it.each([
    [null, 45, 45],
    [0, -45, 315],
    [315, 90, 45],
  ])('turns %s by %s to %s', (facing, delta, turned) => {
    expect(turnedOf(facing, delta)).toBe(turned);
  });
});

describe('stagePointOfShare', () => {
  it.each([
    [
      { x: 0.5, y: 0.25 },
      { rightMetres: 0, backMetres: 2 },
    ],
    [
      { x: 0, y: 1 },
      { rightMetres: 5, backMetres: 8 },
    ],
  ])('reads %o in the dancers view', (share, point) => {
    expect(stagePointOfShare(share, stage)).toEqual(point);
  });
});
