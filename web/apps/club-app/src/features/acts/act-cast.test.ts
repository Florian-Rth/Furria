import { describe, expect, it } from 'vitest';
import type { CatalogueAct } from '@/features/running-order/schemas';
import type { CastDraft } from './act-cast';
import { addCastPerson, castBodyOf, membersOfAct, toggleCastPerson } from './act-cast';

const person = (personId: number, firstName: string) => ({
  personId,
  firstName,
  lastName: 'Narr',
  portrait: null,
});

const members = [person(1, 'Anna'), person(2, 'Ben'), person(3, 'Carla')];

const draft: CastDraft = { removedIds: [2], added: [person(9, 'Zoe'), person(1, 'Anna')] };

describe('membersOfAct', () => {
  it('rebuilds the group members from the cast, the guests and the removed people', () => {
    const act: CatalogueAct = {
      actId: 1,
      name: 'Marsch',
      kind: 'dance',
      group: { groupId: 1, name: 'Garde', tone: null, icon: null, picture: null },
      sessionYear: null,
      closed: false,
      archived: false,
      cast: [
        { ...person(3, 'Carla'), absent: false },
        { ...person(9, 'Zoe'), absent: false },
        { ...person(1, 'Anna'), absent: false },
      ],
      added: [person(9, 'Zoe')],
      removed: [person(2, 'Ben')],
      wishes: [],
    };

    expect(membersOfAct(act).map((member) => member.personId)).toEqual([1, 2, 3]);
  });
});

describe('toggleCastPerson', () => {
  it.each([
    [2, true, { removedIds: [], added: [9, 1] }],
    [9, true, { removedIds: [2], added: [1] }],
  ])('person %s (grouped %s)', (personId, grouped, expected) => {
    const next = toggleCastPerson(draft, members, grouped, personId);

    expect({
      removedIds: next.removedIds,
      added: next.added.map((entry) => entry.personId),
    }).toEqual(expected);
  });
});

describe('addCastPerson', () => {
  it.each([
    [person(2, 'Ben'), true, { removedIds: [], added: [9, 1] }],
    [person(7, 'Gast'), true, { removedIds: [2], added: [9, 1, 7] }],
  ])('adds %j (grouped %s)', (added, grouped, expected) => {
    const next = addCastPerson(draft, members, grouped, added);

    expect({
      removedIds: next.removedIds,
      added: next.added.map((entry) => entry.personId),
    }).toEqual(expected);
  });
});

describe('castBodyOf', () => {
  it.each([[true, { addedPersonIds: [9], removedPersonIds: [2] }]])(
    'builds the change lists (grouped %s)',
    (grouped, expected) => {
      expect(castBodyOf({ ...draft, removedIds: [2, 42] }, members, grouped)).toEqual(expected);
    },
  );
});
