import { describe, expect, it } from 'vitest';
import type { SpotPath } from '@/features/act-player/choreography-motion';
import type { StudioSpot } from '@/features/acts/schemas';
import { formationAt } from './studio-b-formation';

const stage = { widthMetres: 10, depthMetres: 8, artworkSvg: null };

const person = { personId: 7, firstName: 'Lena', lastName: 'Brandt', portrait: null };

const spots: StudioSpot[] = [
  { spotId: 1, number: 1, person },
  { spotId: 2, number: 2, person: null },
  { spotId: 3, number: 3, person: { ...person, personId: 8 } },
];

const still = (spotId: number, rightMetres: number, backMetres: number): SpotPath => ({
  spotId,
  keyframes: [
    {
      seconds: 0,
      position: { rightMetres, backMetres },
      bend: null,
      easing: 'linear',
      facingDegrees: 90,
    },
  ],
});

describe('formationAt', () => {
  it('places dots as shares of the stage seen from the audience, own dot last', () => {
    const paths = [still(1, 0, 0), still(2, -5, 8), still(3, 2.5, 4)];

    expect(formationAt(paths, spots, stage, 1, 3)).toEqual([
      { spotId: 3, number: 3, x: 0.75, y: 0.5, facing: 90, role: 'cast' },
      { spotId: 2, number: 2, x: 0, y: 0, facing: 90, role: 'open' },
      { spotId: 1, number: 1, x: 0.5, y: 1, facing: 90, role: 'own' },
    ]);
  });

  it('skips paths without a spot', () => {
    expect(formationAt([still(9, 0, 0)], spots, stage, null, 0)).toEqual([]);
  });
});
