import { describe, expect, it } from 'vitest';
import type { CatalogueAct } from '@/features/running-order/schemas';
import { carriersOf, overlapsOf } from './acts-overlap';

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
  sessionYear: null,
  closed: false,
  archived,
  cast: castIds.map((personId) => ({ ...person(personId, `P${personId}`), absent: false })),
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
