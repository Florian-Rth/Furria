import type { CatalogueAct } from '@/features/running-order/schemas';
import type { PortraitPersonRef } from '@/lib/api/schemas';

export interface PersonLoad {
  person: PortraitPersonRef;
  actIds: number[];
}

export interface ActOverlap {
  shared: number;
  total: number;
}

export interface SharedAct {
  act: CatalogueAct;
  people: PortraitPersonRef[];
}

export type Spotlight = 'rest' | 'lit' | 'dimmed';

const COLLATOR = new Intl.Collator('de-DE');

const activeOf = (acts: readonly CatalogueAct[]): CatalogueAct[] =>
  acts.filter((act) => !act.archived);

const byPersonName = (left: PortraitPersonRef, right: PortraitPersonRef): number =>
  COLLATOR.compare(left.lastName, right.lastName) ||
  COLLATOR.compare(left.firstName, right.firstName);

export const personLoadsOf = (acts: readonly CatalogueAct[]): PersonLoad[] => {
  const loads = new Map<number, PersonLoad>();

  for (const act of activeOf(acts)) {
    for (const person of act.cast) {
      const load = loads.get(person.personId);

      if (load === undefined) {
        loads.set(person.personId, { person, actIds: [act.actId] });
      } else if (!load.actIds.includes(act.actId)) {
        load.actIds.push(act.actId);
      }
    }
  }

  return [...loads.values()].sort(
    (left, right) =>
      right.actIds.length - left.actIds.length || byPersonName(left.person, right.person),
  );
};

export const carriersOf = (acts: readonly CatalogueAct[]): PersonLoad[] =>
  personLoadsOf(acts).filter((load) => load.actIds.length > 1);

export const overlapsOf = (acts: readonly CatalogueAct[]): Map<number, ActOverlap> => {
  const loads = new Map(personLoadsOf(acts).map((load) => [load.person.personId, load]));

  return new Map(
    acts.map((act) => [
      act.actId,
      {
        shared: act.cast.filter((person) =>
          (loads.get(person.personId)?.actIds ?? []).some((actId) => actId !== act.actId),
        ).length,
        total: act.cast.length,
      },
    ]),
  );
};

export const sharedActsOf = (
  actId: number | null,
  cast: readonly PortraitPersonRef[],
  acts: readonly CatalogueAct[],
): SharedAct[] => {
  const castIds = new Set(cast.map((person) => person.personId));

  return activeOf(acts)
    .filter((act) => act.actId !== actId)
    .map((act) => ({
      act,
      people: act.cast
        .filter((person) => castIds.has(person.personId))
        .map(({ personId, firstName, lastName, portrait }) => ({
          personId,
          firstName,
          lastName,
          portrait,
        }))
        .sort(byPersonName),
    }))
    .filter((shared) => shared.people.length > 0)
    .sort(
      (left, right) =>
        right.people.length - left.people.length || COLLATOR.compare(left.act.name, right.act.name),
    );
};

export const spotlightOf = (act: CatalogueAct, personId: number | null): Spotlight => {
  if (personId === null) {
    return 'rest';
  }

  return act.cast.some((person) => person.personId === personId) ? 'lit' : 'dimmed';
};

export const personInActsOf = (
  personId: number | null,
  acts: readonly CatalogueAct[],
): PersonLoad | null =>
  personId === null
    ? null
    : (personLoadsOf(acts).find((load) => load.person.personId === personId) ?? null);

export const carriersAmongOf = (
  all: readonly CatalogueAct[],
  scoped: readonly CatalogueAct[],
): PersonLoad[] => {
  const scopedIds = new Set(personLoadsOf(scoped).map((load) => load.person.personId));

  return carriersOf(all).filter((load) => scopedIds.has(load.person.personId));
};
