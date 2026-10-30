import { describe, expect, it } from 'vitest';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { StudioSpot, StudioStage } from '@/features/acts/schemas';
import { cueSideOf, stageDotsAt, stageSummaryOf, viewRouteOf } from './practice-stage';

const stage: StudioStage = { widthMetres: 10, depthMetres: 8, artworkSvg: null };

const person = { personId: 7, firstName: 'Lena', lastName: 'Brandt', portrait: null };

const spots: StudioSpot[] = [
  { spotId: 1, number: 1, person },
  { spotId: 2, number: 2, person: { ...person, personId: 8 } },
  { spotId: 3, number: 3, person: null },
];

const still = (spotId: number, rightMetres: number, backMetres: number): SpotPath => ({
  spotId,
  keyframes: [
    {
      seconds: 0,
      position: { rightMetres, backMetres },
      bend: null,
      easing: 'linear',
      facingDegrees: 0,
    },
  ],
});

const paths: SpotPath[] = [still(1, 2, 2), still(2, -4, 0), still(3, 0, 8), still(9, 0, 0)];

describe('viewRouteOf', () => {
  it('draws the stage as the dancers see it, the audience at the top', () => {
    expect(
      viewRouteOf(
        [
          { rightMetres: 5, backMetres: 0 },
          { rightMetres: -5, backMetres: 8 },
        ],
        stage,
      ),
    ).toEqual([
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ]);
  });
});

describe('stageDotsAt', () => {
  it('marks your own spot, the cast and the open spots, yours drawn last', () => {
    expect(stageDotsAt({ paths, spots, ownSpotId: 1, stage }, 0)).toEqual([
      { spotId: 3, number: 3, kind: 'open', x: 0.5, y: 1, turn: null },
      { spotId: 2, number: 2, kind: 'cast', x: 0.9, y: 0, turn: null },
      { spotId: 1, number: 1, kind: 'own', x: 0.3, y: 0.25, turn: 180 },
    ]);
  });

  it('shows the whole formation without a spot of your own', () => {
    expect(stageDotsAt({ paths, spots, ownSpotId: null, stage }, 0).map((dot) => dot.kind)).toEqual(
      ['open', 'cast', 'cast'],
    );
  });
});

describe('cueSideOf', () => {
  it.each([
    [{ x: 0.5, y: 0.5 }, [{ x: 0.5, y: 0.2 }], 'below'],
    [{ x: 0.5, y: 0.5 }, [{ x: 0.5, y: 0.8 }], 'above'],
    [{ x: 0.5, y: 0.5 }, [{ x: 0.9, y: 0.5 }], 'above'],
    [{ x: 0.5, y: 0.1 }, [{ x: 0.9, y: 0.1 }], 'below'],
    [{ x: 0.5, y: 0.1 }, [], 'below'],
  ] as const)('at %o heading to %o the cue sits %s', (own, route, side) => {
    expect(cueSideOf(own, route)).toBe(side);
  });
});

describe('stageSummaryOf', () => {
  it('names her own spot and the open spots in number order', () => {
    const shuffled: StudioSpot[] = [
      { spotId: 9, number: 12, person: null },
      ...spots,
      { spotId: 8, number: 11, person: null },
    ];

    expect(stageSummaryOf(shuffled, 2)).toEqual({ own: 2, open: [3, 11, 12] });
  });

  it('has no own spot for a viewer outside the cast', () => {
    expect(stageSummaryOf(spots, null)).toEqual({ own: null, open: [3] });
  });
});
