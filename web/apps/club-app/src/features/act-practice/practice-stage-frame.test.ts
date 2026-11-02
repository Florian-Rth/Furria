import { describe, expect, it } from 'vitest';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { StudioStage } from '@/features/acts/schemas';
import { stageFrameOf } from './practice-stage-frame';

const stage: StudioStage = { widthMetres: 10, depthMetres: 8, artworkSvg: null };

const keyframe = (seconds: number, rightMetres: number, backMetres: number) => ({
  seconds,
  position: { rightMetres, backMetres },
  bend: null,
  easing: 'linear' as const,
  facingDegrees: null,
});

const pathOf = (spotId: number, ...keyframes: ReturnType<typeof keyframe>[]): SpotPath => ({
  spotId,
  keyframes,
});

const backRow = [
  pathOf(1, keyframe(0, 4, 7), keyframe(4, 4, 7), keyframe(8, 4, 3)),
  pathOf(2, keyframe(0, -4, 7), keyframe(8, -4, 7)),
];

describe('stageFrameOf', () => {
  it.each([
    {
      range: { start: 0, end: 4 },
      expected: { left: 0, top: 0.6, width: 1, height: 0.4 },
    },
    {
      range: { start: 4, end: 8 },
      expected: { left: 0, top: 0.219, width: 1, height: 0.781 },
    },
    { range: null, expected: { left: 0, top: 0, width: 1, height: 1 } },
  ])('frames everyone the step uses in $range', ({ range, expected }) => {
    expect(stageFrameOf(backRow, [], range, stage)).toEqual(expected);
  });

  it('keeps a small cluster at least four tenths of the stage wide and deep', () => {
    const cluster = [pathOf(1, keyframe(0, 0, 4)), pathOf(2, keyframe(0, 0.5, 4))];

    expect(stageFrameOf(cluster, [], { start: 0, end: 4 }, stage)).toEqual({
      left: 0.275,
      top: 0.3,
      width: 0.4,
      height: 0.4,
    });
  });
});
