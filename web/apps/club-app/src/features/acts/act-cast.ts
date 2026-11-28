import type { PortraitPersonRef } from '@/lib/api/schemas';

export interface CastDraft {
  removedIds: number[];
  added: PortraitPersonRef[];
}

export type CastTileState = 'in' | 'out' | 'guest' | 'person';

export interface CastTile {
  person: PortraitPersonRef;
  state: CastTileState;
}

const COLLATOR = new Intl.Collator('de-DE');

const portraitOf = ({
  personId,
  firstName,
  lastName,
  portrait,
}: PortraitPersonRef): PortraitPersonRef => ({ personId, firstName, lastName, portrait });

const byName = (left: PortraitPersonRef, right: PortraitPersonRef): number =>
  COLLATOR.compare(left.firstName, right.firstName) ||
  COLLATOR.compare(left.lastName, right.lastName);

const isMember = (members: readonly PortraitPersonRef[], personId: number): boolean =>
  members.some((member) => member.personId === personId);

export const castTilesOf = (
  members: readonly PortraitPersonRef[],
  draft: CastDraft,
  grouped: boolean,
): CastTile[] => {
  if (!grouped) {
    return [...draft.added].sort(byName).map((person) => ({ person, state: 'person' }));
  }

  const memberTiles: CastTile[] = [...members].sort(byName).map((person) => ({
    person: portraitOf(person),
    state: draft.removedIds.includes(person.personId) ? 'out' : 'in',
  }));
  const guestTiles: CastTile[] = draft.added
    .filter((person) => !isMember(members, person.personId))
    .sort(byName)
    .map((person) => ({ person, state: 'guest' }));

  return [...memberTiles, ...guestTiles];
};
