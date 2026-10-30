import { describe, expect, it } from 'vitest';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { StudioPart, StudioStep } from '@/features/acts/schemas';
import { keyframeTicksOf, moveBarsOf, songNameOf, stepBlocksOf } from './studio-g-lanes';

const stepOf = (stepId: number, start: number): StudioStep => ({
  stepId,
  name: `S${stepId}`,
  description: null,
  startSeconds: start,
  endSeconds: start + 4,
  placement: 'onTimeline',
});

const partOf = (partId: number, stepIds: number[]): StudioPart => ({
  partId,
  name: `P${partId}`,
  stepIds,
  mainVideoId: null,
  adrift: false,
});

const pathOf = (spotId: number, points: readonly [number, number][]): SpotPath => ({
  spotId,
  keyframes: points.map(([seconds, right]) => ({
    seconds,
    position: { rightMetres: right, backMetres: 0 },
    bend: null,
    easing: 'linear',
    facingDegrees: null,
  })),
});

const paths = [
  pathOf(1, [
    [0, 0],
    [2, 0],
    [4, 1],
  ]),
  pathOf(2, [
    [0, 0],
    [3, 1],
    [6, 1],
  ]),
];

describe('studio-g lanes', () => {
  it('opens a part gap only where the part changes and keeps the first border fixed', () => {
    const blocks = stepBlocksOf(
      [stepOf(1, 0), stepOf(2, 4), stepOf(3, 8)],
      [partOf(1, [1, 2]), partOf(2, [3])],
    );

    expect(blocks.map((block) => [block.opensPart, block.movable])).toEqual([
      [false, false],
      [false, true],
      [true, true],
    ]);
  });

  it.each([
    [[], [0, 2, 3, 4, 6]],
    [[2], [0, 3, 6]],
  ])('collects keyframe moments for spots %j', (spotIds, expected) => {
    expect(keyframeTicksOf(paths, spotIds).map((tick) => tick.seconds)).toEqual(expected);
  });

  it('merges overlapping moves into one bar', () => {
    expect(moveBarsOf(paths, [])).toEqual([{ start: 0, end: 4 }]);
  });

  it.each([
    ['01 Marsch.mp3', '01 Marsch'],
    ['Finale (v2).wav', 'Finale (v2)'],
  ])('names a song after its file %s', (fileName, expected) => {
    expect(songNameOf(fileName)).toBe(expected);
  });
});
