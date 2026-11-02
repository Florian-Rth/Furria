import type { StudioSpot } from '@furria/studio/studio-schemas';

export type SpotPerson = NonNullable<StudioSpot['person']>;

export const spotPersonOf = (person: SpotPerson): SpotPerson => ({
  personId: person.personId,
  firstName: person.firstName,
  lastName: person.lastName,
  portrait: person.portrait,
});

export const byNameOf = (left: SpotPerson, right: SpotPerson): number =>
  left.firstName.localeCompare(right.firstName) || left.lastName.localeCompare(right.lastName);

export interface HolderMove {
  spotId: number;
  person: SpotPerson | null;
}

export const holderMovesOf = (
  spots: readonly StudioSpot[],
  person: SpotPerson,
  toSpotId: number | null,
): HolderMove[] => {
  const from = spots.find((spot) => spot.person?.personId === person.personId) ?? null;
  if (from?.spotId === toSpotId) {
    return [];
  }
  if (toSpotId === null) {
    return from === null ? [] : [{ spotId: from.spotId, person: null }];
  }
  const to = spots.find((spot) => spot.spotId === toSpotId);
  if (to === undefined) {
    return [];
  }
  const swapped =
    from === null || to.person === null ? [] : [{ spotId: from.spotId, person: to.person }];

  return [{ spotId: to.spotId, person }, ...swapped];
};
