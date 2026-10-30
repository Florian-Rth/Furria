import { describe, expect, it } from 'vitest';
import type { SpotPath, TimedKeyframe } from '@/features/act-player/choreography-motion';
import {
  draftPositionAt,
  moveWindowOf,
  spotMovesOf,
  stagePointOfShare,
} from './studio-i-formation';

const keyframe = (seconds: number, rightMetres: number, backMetres: number): TimedKeyframe => ({
  seconds,
  position: { rightMetres, backMetres },
  bend: null,
  easing: 'linear',
  facingDegrees: null,
});

const path: SpotPath = {
  spotId: 7,
  keyframes: [keyframe(0, -4, 6), keyframe(6, -4, 6), keyframe(8, -4, 2), keyframe(16, -4, 2)],
};
const span = { stepId: 1, start: 0, end: 8 };
const still = { stepId: 2, start: 8, end: 16 };
const empty = { places: new Map(), starts: new Map() };

describe('stagePointOfShare', () => {
  it('turns a point on the stage seen by the dancers into metres, snapped to a quarter metre', () => {
    expect(
      stagePointOfShare({ x: 0.26, y: 0.5 }, { widthMetres: 10, depthMetres: 7, artworkSvg: null }),
    ).toEqual({ rightMetres: 2.5, backMetres: 3.5 });
  });

  it('keeps the point on the stage', () => {
    expect(
      stagePointOfShare({ x: -1, y: 2 }, { widthMetres: 10, depthMetres: 7, artworkSvg: null }),
    ).toEqual({ rightMetres: 5, backMetres: 7 });
  });
});

describe('moveWindowOf', () => {
  it('finds when a spot moves inside a step', () => {
    expect(moveWindowOf(path, span)).toEqual({ start: 6, end: 8 });
  });

  it('has no window when the spot stands still', () => {
    expect(moveWindowOf(path, still)).toBeNull();
  });
});

describe('spotMovesOf', () => {
  it('reads where a spot starts and ends in a step', () => {
    expect(spotMovesOf([path], span, 1, empty)).toEqual([
      {
        spotId: 7,
        from: { rightMetres: -4, backMetres: 6 },
        to: { rightMetres: -4, backMetres: 2 },
        window: { start: 6, end: 8 },
        bent: false,
        drafted: false,
      },
    ]);
  });

  it('moves over the whole step when a still spot is given a new place', () => {
    const draft = {
      places: new Map([['2:7', { rightMetres: 0, backMetres: 2 }]]),
      starts: new Map(),
    };

    expect(spotMovesOf([path], still, 2, draft)[0]?.window).toEqual({ start: 8, end: 16 });
  });

  it('starts the move at the chosen count', () => {
    const draft = { places: new Map(), starts: new Map([['1:7', 4]]) };

    expect(spotMovesOf([path], span, 1, draft)[0]?.window).toEqual({ start: 4, end: 8 });
  });
});

describe('draftPositionAt', () => {
  it('follows a new place half way through the move', () => {
    const draft = {
      places: new Map([['1:7', { rightMetres: 0, backMetres: 2 }]]),
      starts: new Map(),
    };
    const [move] = spotMovesOf([path], span, 1, draft);

    expect(move === undefined ? null : draftPositionAt(path, move, 7)).toEqual({
      rightMetres: -2,
      backMetres: 4,
    });
  });
});
