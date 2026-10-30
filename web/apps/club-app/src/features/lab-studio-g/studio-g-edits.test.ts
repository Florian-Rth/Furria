import { describe, expect, it } from 'vitest';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { StudioStep } from '@/features/acts/schemas';
import { clampedBorderOf, draggedPointOf, heldIndexesOf, withBordersOf } from './studio-g-edits';

const stepOf = (stepId: number, start: number, end: number): StudioStep => ({
  stepId,
  name: `S${stepId}`,
  description: null,
  startSeconds: start,
  endSeconds: end,
  placement: 'onTimeline',
});

const steps = [stepOf(1, 0, 8), stepOf(2, 8, 16), stepOf(3, 16, 24)];

const pathOf = (points: readonly [number, number][]): SpotPath => ({
  spotId: 1,
  keyframes: points.map(([seconds, right]) => ({
    seconds,
    position: { rightMetres: right, backMetres: 2 },
    bend: null,
    easing: 'linear',
    facingDegrees: null,
  })),
});

describe('studio-g edits', () => {
  it.each([
    [2, 10, 10],
    [2, 0, 0.5],
    [2, 30, 15.5],
    [1, 3, null],
  ])('clamps the start of step %d moved to %d', (stepId, seconds, expected) => {
    expect(clampedBorderOf(steps, stepId, seconds)).toBe(expected);
  });

  it('moves a border so the steps keep tiling the music', () => {
    const moved = withBordersOf(steps, new Map([[2, 10]]));

    expect(moved.map((step) => [step.startSeconds, step.endSeconds])).toEqual([
      [0, 10],
      [10, 16],
      [16, 24],
    ]);
  });

  it.each([
    [3, [0, 1]],
    [6, [0, 1]],
    [8, [2, 3]],
    [12, [2, 3]],
  ])('holds the formation in force at %d', (seconds, expected) => {
    const path = pathOf([
      [0, 0],
      [5, 0],
      [8, 3],
      [12, 3],
    ]);

    expect(heldIndexesOf(path, seconds)).toEqual(expected);
  });

  it.each([
    ['audience' as const, { x: 0.1, y: -0.1 }, { rightMetres: 2, backMetres: 3 }],
    ['dancers' as const, { x: 0.1, y: -0.1 }, { rightMetres: 0, backMetres: 1 }],
    ['audience' as const, { x: 1, y: 1 }, { rightMetres: 5, backMetres: 0 }],
  ])('drags a point seen from the %s', (viewpoint, delta, expected) => {
    const stage = { widthMetres: 10, depthMetres: 10, artworkSvg: null };

    expect(draggedPointOf({ rightMetres: 1, backMetres: 2 }, delta, stage, viewpoint)).toEqual(
      expected,
    );
  });
});
