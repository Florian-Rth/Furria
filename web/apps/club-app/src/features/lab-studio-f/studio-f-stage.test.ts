import { describe, expect, it } from 'vitest';
import type { SpotPose } from '@/features/act-player/choreography-motion';
import type { StudioSpot, StudioStage } from '@/features/acts/schemas';
import { frontOf, stageDotsOf, viewpointOf } from './studio-f-stage';

const stage: StudioStage = { widthMetres: 10, depthMetres: 6, artworkSvg: null };

const person = { personId: 7, firstName: 'Lena', lastName: 'Brandt', portrait: null };

const spots: StudioSpot[] = [
  { spotId: 1, number: 1, person },
  { spotId: 2, number: 2, person: { ...person, personId: 8 } },
  { spotId: 3, number: 3, person: null },
];

const pose = (spotId: number, rightMetres: number, backMetres: number): SpotPose => ({
  spotId,
  position: { rightMetres, backMetres },
  facingDegrees: 90,
  moving: false,
});

const poses = [pose(1, 2, 1), pose(2, -1, 3), pose(3, 0, 5), pose(9, 0, 0)];

describe('viewpoint and front', () => {
  it.each([
    [true, 'dancers', 'top'],
    [false, 'audience', 'bottom'],
  ] as const)(
    'mirrored %s looks from %s with the front at the %s',
    (mirrored, viewpoint, front) => {
      expect(viewpointOf(mirrored)).toBe(viewpoint);
      expect(frontOf(viewpoint)).toBe(front);
    },
  );
});

describe('stageDotsOf', () => {
  it('marks the own, cast and open spots and draws the own dot last', () => {
    expect(stageDotsOf(poses, spots, 1, stage, 'audience')).toEqual([
      { id: '2', x: 4, y: 3, number: 2, kind: 'cast', rotation: 90 },
      { id: '3', x: 5, y: 1, number: 3, kind: 'open', rotation: 90 },
      { id: '1', x: 7, y: 5, number: 1, kind: 'own', rotation: 90 },
    ]);
  });

  it('turns the stage around for the dancers view', () => {
    expect(stageDotsOf([pose(1, 2, 1)], spots, null, stage, 'dancers')).toEqual([
      { id: '1', x: 3, y: 1, number: 1, kind: 'cast', rotation: 270 },
    ]);
  });
});
