import { describe, expect, it } from 'vitest';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { StudioStage } from '@/features/acts/schemas';
import { stepWayOf } from './practice-step-way';

const stage: StudioStage = { widthMetres: 10, depthMetres: 8, artworkSvg: null };

const keyframe = (seconds: number, rightMetres: number, backMetres: number) => ({
  seconds,
  position: { rightMetres, backMetres },
  bend: null,
  easing: 'linear' as const,
  facingDegrees: null,
});

const walk: SpotPath = {
  spotId: 1,
  keyframes: [keyframe(0, 0, 8), keyframe(2, 0, 8), keyframe(4, 0, 0), keyframe(8, 0, 0)],
};

const marks = [1, 2, 3, 4, 5, 6, 7, 8].map((count) => ({ seconds: count * 0.5, count }));

describe('stepWayOf', () => {
  it.each([
    { range: { start: 0, end: 4 }, seconds: 0, expected: [5, 6, 7, 8] },
    { range: { start: 0, end: 4 }, seconds: 3, expected: [7, 8] },
    { range: { start: 0, end: 2 }, seconds: 0, expected: null },
    { range: { start: 4, end: 8 }, seconds: 0, expected: null },
    { range: { start: 0, end: 4 }, seconds: 4, expected: null },
  ])(
    'marks the counts she arrives on from $seconds s in $range',
    ({ range, seconds, expected }) => {
      const way = stepWayOf(walk, marks, range, seconds, stage);

      expect(way === null ? null : way.marks.map((mark) => mark.count)).toEqual(expected);
    },
  );

  it('runs the way from her place now to the end of the step', () => {
    const way = stepWayOf(walk, marks, { start: 0, end: 4 }, 3, stage);

    expect([way?.points[0], way?.points.at(-1)]).toEqual([
      { x: 0.5, y: 0.5 },
      { x: 0.5, y: 0 },
    ]);
  });

  it('samples the way evenly when the music has no counts', () => {
    const way = stepWayOf(walk, [], { start: 0, end: 4 }, 0, stage);

    expect([way?.points.length, way?.marks.length]).toEqual([25, 0]);
  });
});
