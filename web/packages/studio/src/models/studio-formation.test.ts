import type { TimedKeyframe } from '@furria/studio/choreography-motion';
import type { MusicSegment } from '@furria/studio/music-timeline';
import {
  anchorAt,
  anchoredTrackOf,
  baseVersionOf,
  distributedOf,
  formationPlacedOf,
  freePointOf,
  presetPointsOf,
} from '@furria/studio/studio-formation';
import type { Keyframe } from '@furria/studio/studio-schemas';
import { describe, expect, it } from 'vitest';

const stage = { widthMetres: 10, depthMetres: 8 };

const point = (right: number, back: number) => ({ rightMetres: right, backMetres: back });

const key = (seconds: number, right: number, back: number): TimedKeyframe => ({
  seconds,
  position: point(right, back),
  bend: null,
  easing: 'linear',
  facingDegrees: null,
});

const segment = (
  mediaItemId: number,
  sourceStart: number,
  sourceEnd: number,
  timelineStart: number,
): MusicSegment => ({
  songId: mediaItemId,
  mediaItemId,
  audioUrl: '/a',
  peaksUrl: '/p',
  audible: true,
  sourceStart,
  sourceEnd,
  timelineStart,
  timelineEnd: timelineStart + sourceEnd - sourceStart,
  beats: [],
});

const mix = [segment(11, 10, 40, 0), segment(12, 5, 25, 30)];

describe('presetPointsOf', () => {
  it('squeezes a long line so it stays a metre off the sides', () => {
    const points = presetPointsOf('line', 9, stage);

    expect([points[0]?.rightMetres, points.at(-1)?.rightMetres]).toEqual([-4, 4]);
  });

  it('builds a block in rows from the front, centring a short last row', () => {
    expect(presetPointsOf('block', 3, stage)).toEqual([
      point(-0.75, 3.25),
      point(0.75, 3.25),
      point(0, 4.75),
    ]);
  });
});

describe('distributedOf', () => {
  it('spaces the spots evenly between the outer ones, keeping their order', () => {
    expect(distributedOf([point(4, 1), point(-4, 2), point(3, 3)], 'across', stage)).toEqual([
      point(4, 1),
      point(-4, 2),
      point(0, 3),
    ]);
  });
});

describe('freePointOf', () => {
  it.each([
    [[point(0, 1)], point(-1, 1)],
    [[point(0, 1), point(-1, 1), point(1.2, 1)], point(-2, 1)],
  ])('finds the free place nearest the front centre among %j', (occupied, expected) => {
    expect(freePointOf(occupied, stage)).toEqual(expected);
  });
});

describe('formationPlacedOf', () => {
  const span = { start: 10, end: 20 };

  it('moves the keyframe at the step border and its hold inside the step', () => {
    const track = [key(0, 0, 0), key(10, 1, 1), key(18, 1, 1), key(20, 3, 3)];

    expect(formationPlacedOf(1, track, span, point(2, 2))).toEqual([
      key(0, 0, 0),
      key(10, 2, 2),
      key(18, 2, 2),
      key(20, 3, 3),
    ]);
  });

  it('adds a keyframe at the border and keeps a hold that started earlier', () => {
    const track = [key(0, 1, 1), key(15, 1, 1), key(20, 3, 3)];

    expect(formationPlacedOf(1, track, span, point(2, 2))).toEqual([
      key(0, 1, 1),
      key(10, 2, 2),
      key(15, 2, 2),
      key(20, 3, 3),
    ]);
  });
});

describe('anchorAt', () => {
  it.each([
    [30, { sourceMediaItemId: 12, seconds: 5 }],
    [51, null],
  ])('places timeline second %s on its song', (seconds, expected) => {
    expect(anchorAt(mix, seconds)).toEqual(expected);
  });
});

describe('anchoredTrackOf', () => {
  const stored = (mediaItemId: number, seconds: number): Keyframe => ({
    sourceMediaItemId: mediaItemId,
    seconds,
    position: point(0, 0),
    bend: null,
    easing: 'linear',
    facingDegrees: null,
  });

  it('anchors the edited keyframes and keeps those whose music is gone', () => {
    const track = anchoredTrackOf(
      [stored(11, 12), stored(11, 2), stored(99, 3)],
      [{ ...key(5, 7, -1), facingDegrees: -90 }],
      mix,
      stage,
    );

    expect(track).toEqual([
      { ...stored(11, 15), position: point(5, 0), facingDegrees: 270 },
      stored(11, 2),
      stored(99, 3),
    ]);
  });
});

describe('baseVersionOf', () => {
  it.each([
    [3, 2, 3],
    [2, 4, 4],
  ])('expects version %s/%s as %s', (saved, cached, expected) => {
    expect(baseVersionOf(saved, cached)).toBe(expected);
  });
});
