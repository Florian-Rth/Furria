import { describe, expect, it } from 'vitest';
import { rowPointsOf, softenedTracksOf } from './stage-writes';

const stage = { widthMetres: 12, depthMetres: 8 };

describe('rowPointsOf', () => {
  it('lines the spots up across and spaces them evenly in one go', () => {
    expect(
      rowPointsOf(
        [
          { rightMetres: -4, backMetres: 2 },
          { rightMetres: 1, backMetres: 3 },
          { rightMetres: 2, backMetres: 4 },
        ],
        'across',
        stage,
      ),
    ).toEqual([
      { rightMetres: -4, backMetres: 3 },
      { rightMetres: -1, backMetres: 3 },
      { rightMetres: 2, backMetres: 3 },
    ]);
  });

  it('lines the spots up one behind the other and spaces them evenly', () => {
    expect(
      rowPointsOf(
        [
          { rightMetres: 0, backMetres: 1 },
          { rightMetres: 1, backMetres: 2 },
          { rightMetres: 2, backMetres: 7 },
        ],
        'deep',
        stage,
      ),
    ).toEqual([
      { rightMetres: 1, backMetres: 1 },
      { rightMetres: 1, backMetres: 4 },
      { rightMetres: 1, backMetres: 7 },
    ]);
  });
});

describe('softenedTracksOf', () => {
  const kept = {
    sourceMediaItemId: 1,
    seconds: 2,
    position: { rightMetres: 0, backMetres: 1 },
    bend: null,
    easing: 'linear' as const,
    facingDegrees: null,
  };

  it('keeps stored waypoints as they are and softens new or changed ones', () => {
    const moved = { ...kept, seconds: 4, position: { rightMetres: 2, backMetres: 1 } };
    const turned = { ...kept, seconds: 6, facingDegrees: 90 };

    expect(
      softenedTracksOf([{ spotId: 5, keyframes: [kept, { ...turned, facingDegrees: null }] }], {
        5: [kept, moved, turned],
      }),
    ).toEqual({
      5: [kept, { ...moved, easing: 'easeInOut' }, { ...turned, easing: 'easeInOut' }],
    });
  });

  it('softens every waypoint of a spot without a stored track', () => {
    expect(softenedTracksOf([], { 7: [kept] })).toEqual({ 7: [{ ...kept, easing: 'easeInOut' }] });
  });
});
