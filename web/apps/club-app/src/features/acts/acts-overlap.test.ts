import { describe, expect, it } from 'vitest';
import type { CatalogueAct } from '@/features/running-order/schemas';
import {
  carriersAmongOf,
  carriersOf,
  overlapsOf,
  personInActsOf,
  sharedActsOf,
  spotlightOf,
} from './acts-overlap';

const person = (personId: number, firstName: string) => ({
  personId,
  firstName,
  lastName: 'Narr',
  portrait: null,
});

const act = (actId: number, name: string, castIds: number[], archived = false): CatalogueAct => ({
  actId,
  name,
  kind: 'dance',
  group: null,
  archived,
  cast: castIds.map((personId) => ({ ...person(personId, `P${personId}`), absent: false })),
  added: [],
  removed: [],
  wishes: [],
});

const acts = [
  act(1, 'Marsch', [1, 2, 3, 4]),
  act(2, 'Show', [1, 2, 5]),
  act(3, 'Ballett', [2, 6]),
  act(4, 'Solo', [7]),
  act(5, 'Alt', [7, 1], true),
];

describe('carriersOf', () => {
  it('lists people in several active acts, most acts first', () => {
    expect(carriersOf(acts).map((load) => [load.person.personId, load.actIds])).toEqual([
      [2, [1, 2, 3]],
      [1, [1, 2]],
    ]);
  });
});

describe('overlapsOf', () => {
  it('counts the people of each act who also stand in another active act', () => {
    expect(Object.fromEntries(overlapsOf(acts))).toEqual({
      1: { shared: 2, total: 4 },
      2: { shared: 2, total: 3 },
      3: { shared: 1, total: 2 },
      4: { shared: 0, total: 1 },
      5: { shared: 2, total: 2 },
    });
  });
});

describe('sharedActsOf', () => {
  it('ranks the other active acts by shared people, then by name', () => {
    const shared = sharedActsOf(1, [person(1, 'P1'), person(2, 'P2'), person(7, 'P7')], acts);

    expect(shared.map((entry) => [entry.act.actId, entry.people.map((p) => p.personId)])).toEqual([
      [2, [1, 2]],
      [3, [2]],
      [4, [7]],
    ]);
  });

  it('works for an act that does not exist yet', () => {
    expect(sharedActsOf(null, [person(6, 'P6')], acts).map((entry) => entry.act.actId)).toEqual([
      3,
    ]);
  });
});

describe('spotlightOf', () => {
  it.each([
    [null, 'rest'],
    [2, 'lit'],
    [7, 'dimmed'],
  ] as const)('person %s → %s', (personId, expected) => {
    expect(spotlightOf(acts[0] as CatalogueAct, personId)).toBe(expected);
  });
});

describe('personInActsOf', () => {
  it.each([
    [null, null],
    [99, null],
    [2, [1, 2, 3]],
  ] as const)('person %s stands in %j', (personId, expected) => {
    expect(personInActsOf(personId, acts)?.actIds ?? null).toEqual(expected);
  });
});

describe('carriersAmongOf', () => {
  it('keeps the carriers who stand in one of the scoped acts, counting all acts', () => {
    expect(
      carriersAmongOf(acts, [acts[2] as CatalogueAct]).map((load) => [
        load.person.personId,
        load.actIds,
      ]),
    ).toEqual([[2, [1, 2, 3]]]);
  });
});
