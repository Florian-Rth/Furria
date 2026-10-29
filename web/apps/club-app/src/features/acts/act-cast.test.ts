import { describe, expect, it } from 'vitest';
import type { CatalogueAct } from '@/features/running-order/schemas';
import type { CastDraft } from './act-cast';
import {
  addCastPerson,
  castBodyOf,
  castTallyOf,
  castTilesOf,
  membersOfAct,
  presentPeopleOf,
  toggleCastPerson,
} from './act-cast';

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

describe('castTilesOf', () => {
  it('shows members as in or out and other added people as guests for a group act', () => {
    expect(
      castTilesOf(members, draft, true).map((tile) => [tile.person.personId, tile.state]),
    ).toEqual([
      [1, 'in'],
      [2, 'out'],
      [3, 'in'],
      [9, 'guest'],
    ]);
  });

  it('shows only the added people for an act without a group', () => {
    expect(
      castTilesOf(members, draft, false).map((tile) => [tile.person.personId, tile.state]),
    ).toEqual([
      [1, 'person'],
      [9, 'person'],
    ]);
  });
});

describe('castTallyOf', () => {
  it('counts present, left out and guests', () => {
    expect(castTallyOf(castTilesOf(members, draft, true))).toEqual({
      present: 3,
      out: 1,
      guests: 1,
    });
  });
});

describe('presentPeopleOf', () => {
  it('keeps everybody who stands in the act', () => {
    expect(
      presentPeopleOf(castTilesOf(members, draft, true)).map((entry) => entry.personId),
    ).toEqual([1, 3, 9]);
  });
});

describe('toggleCastPerson', () => {
  it.each([
    [2, true, { removedIds: [], added: [9, 1] }],
    [3, true, { removedIds: [2, 3], added: [9, 1] }],
    [9, true, { removedIds: [2], added: [1] }],
    [1, false, { removedIds: [2], added: [9] }],
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
    [person(9, 'Zoe'), false, { removedIds: [2], added: [9, 1] }],
  ])('adds %j (grouped %s)', (added, grouped, expected) => {
    const next = addCastPerson(draft, members, grouped, added);

    expect({
      removedIds: next.removedIds,
      added: next.added.map((entry) => entry.personId),
    }).toEqual(expected);
  });
});

describe('castBodyOf', () => {
  it.each([
    [true, { addedPersonIds: [9], removedPersonIds: [2] }],
    [false, { addedPersonIds: [9, 1], removedPersonIds: [] }],
  ])('builds the change lists (grouped %s)', (grouped, expected) => {
    expect(castBodyOf({ ...draft, removedIds: [2, 42] }, members, grouped)).toEqual(expected);
  });
});
