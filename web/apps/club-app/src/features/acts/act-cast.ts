import type { CatalogueAct } from '@/features/running-order/schemas';
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

export interface CastTally {
  present: number;
  out: number;
  guests: number;
}

export interface CastBody {
  addedPersonIds: number[];
  removedPersonIds: number[];
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

export const EMPTY_CAST: CastDraft = { removedIds: [], added: [] };

export const castDraftOf = (act: CatalogueAct): CastDraft => ({
  removedIds: act.removed.map((person) => person.personId),
  added: act.added.map(portraitOf),
});

export const membersOfAct = (act: CatalogueAct): PortraitPersonRef[] => {
  const addedIds = new Set(act.added.map((person) => person.personId));
  const present = act.cast.filter((person) => !addedIds.has(person.personId));

  return [...present, ...act.removed]
    .map(portraitOf)
    .filter(
      (person, index, all) =>
        all.findIndex((other) => other.personId === person.personId) === index,
    )
    .sort(byName);
};

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

export const castTallyOf = (tiles: readonly CastTile[]): CastTally => ({
  present: tiles.filter((tile) => tile.state !== 'out').length,
  out: tiles.filter((tile) => tile.state === 'out').length,
  guests: tiles.filter((tile) => tile.state === 'guest').length,
});

export const presentPeopleOf = (tiles: readonly CastTile[]): PortraitPersonRef[] =>
  tiles.filter((tile) => tile.state !== 'out').map((tile) => tile.person);

export const toggleCastPerson = (
  draft: CastDraft,
  members: readonly PortraitPersonRef[],
  grouped: boolean,
  personId: number,
): CastDraft => {
  if (grouped && isMember(members, personId)) {
    return draft.removedIds.includes(personId)
      ? { ...draft, removedIds: draft.removedIds.filter((id) => id !== personId) }
      : { ...draft, removedIds: [...draft.removedIds, personId] };
  }

  return { ...draft, added: draft.added.filter((person) => person.personId !== personId) };
};

export const addCastPerson = (
  draft: CastDraft,
  members: readonly PortraitPersonRef[],
  grouped: boolean,
  person: PortraitPersonRef,
): CastDraft => {
  if (grouped && isMember(members, person.personId)) {
    return { ...draft, removedIds: draft.removedIds.filter((id) => id !== person.personId) };
  }
  if (draft.added.some((added) => added.personId === person.personId)) {
    return draft;
  }

  return { ...draft, added: [...draft.added, portraitOf(person)] };
};

export const castBodyOf = (
  draft: CastDraft,
  members: readonly PortraitPersonRef[],
  grouped: boolean,
): CastBody => {
  if (!grouped) {
    return { addedPersonIds: draft.added.map((person) => person.personId), removedPersonIds: [] };
  }

  return {
    addedPersonIds: draft.added
      .filter((person) => !isMember(members, person.personId))
      .map((person) => person.personId),
    removedPersonIds: draft.removedIds.filter((personId) => isMember(members, personId)),
  };
};
