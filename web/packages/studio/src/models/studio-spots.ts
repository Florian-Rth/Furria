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
