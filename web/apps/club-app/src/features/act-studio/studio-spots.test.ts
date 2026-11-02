import type { StudioSpot } from '@furria/studio/studio-schemas';
import { describe, expect, it } from 'vitest';
import type { HolderMove, SpotPerson } from './studio-spots';
import { holderMovesOf } from './studio-spots';

const person = (personId: number): SpotPerson => ({
  personId,
  firstName: `P${personId}`,
  lastName: 'X',
  portrait: null,
});

const spots: StudioSpot[] = [
  { spotId: 1, number: 1, person: person(7) },
  { spotId: 2, number: 2, person: person(8) },
  { spotId: 3, number: 3, person: null },
];

describe('holderMovesOf', () => {
  it.each<[string, number, number | null, HolderMove[]]>([
    [
      'swaps two holders',
      7,
      2,
      [
        { spotId: 2, person: person(7) },
        { spotId: 1, person: person(8) },
      ],
    ],
    ['moves a holder to an open place', 7, 3, [{ spotId: 3, person: person(7) }]],
    ['frees a holder', 8, null, [{ spotId: 2, person: null }]],
    ['seats a free person on a held place', 9, 1, [{ spotId: 1, person: person(9) }]],
    ['keeps a free person free', 9, null, []],
    ['keeps a holder on the own place', 7, 1, []],
    ['ignores an unknown place', 7, 99, []],
  ])('%s', (_, personId, toSpotId, moves) => {
    expect(holderMovesOf(spots, person(personId), toSpotId)).toEqual(moves);
  });
});
