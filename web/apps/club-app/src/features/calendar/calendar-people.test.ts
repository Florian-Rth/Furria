import { describe, expect, it } from 'vitest';
import {
  MATCH_LIMIT,
  toChosenPeople,
  toChosenWithGroup,
  toChosenWithPerson,
  toGroupShortcuts,
  toPersonMatches,
} from './calendar-people';

const ANNA = { personId: 1, firstName: 'Anna', lastName: 'Müller', groupIds: [7] };
const JOERG = { personId: 2, firstName: 'Jörg', lastName: 'Schmidt', groupIds: [7, 9] };
const LENA = { personId: 3, firstName: 'Lena', lastName: 'Anders', groupIds: [] };
const PEOPLE = [ANNA, JOERG, LENA];

describe('toPersonMatches', () => {
  it.each([
    ['', [], []],
    ['an', [], [1, 3]],
    ['joerg', [], []],
    ['jorg sch', [], [2]],
    ['MÜLLER', [], [1]],
    ['an', ['1'], [3]],
  ] as const)('finds %j with %j chosen: %j', (query, chosen, expected) => {
    expect(toPersonMatches(PEOPLE, query, [...chosen]).map((person) => person.personId)).toEqual(
      expected,
    );
  });

  it('caps the matches', () => {
    const many = Array.from({ length: 20 }, (_, index) => ({
      personId: index + 1,
      firstName: 'Anna',
      lastName: `Nr${index}`,
      groupIds: [],
    }));

    expect(toPersonMatches(many, 'anna', [])).toHaveLength(MATCH_LIMIT);
  });
});

describe('toChosenPeople', () => {
  it('names the chosen in their order and falls back to the held names', () => {
    const held = [{ personId: 44, firstName: 'Ex', lastName: 'Mitglied' }];

    expect(
      toChosenPeople(['2', '44', '99'], PEOPLE, held).map((person) => person.personId),
    ).toEqual([2, 44]);
  });
});

describe('toGroupShortcuts', () => {
  const groups = [
    { groupId: 7, name: 'Tanzgarde' },
    { groupId: 9, name: 'Elferrat' },
    { groupId: 5, name: 'Leer' },
  ];

  it.each([[[], [7, ['1', '2']], [9, ['2']]], [['2'], [7, ['1']]], [['1', '2']]] as const)(
    'offers with %j chosen: %j',
    (chosen, ...expected) => {
      expect(
        toGroupShortcuts(groups, PEOPLE, [...chosen]).map((shortcut) => [
          shortcut.groupId,
          shortcut.missingIds,
        ]),
      ).toEqual(expected);
    },
  );
});

describe('chosen people edits', () => {
  it('adds a whole group once', () => {
    expect(toChosenWithGroup(['2', '3'], { missingIds: ['1', '2'] })).toEqual(['2', '3', '1']);
  });

  it('adds a person once', () => {
    expect(toChosenWithPerson(['1'], 1)).toEqual(['1']);
    expect(toChosenWithPerson(['1'], 2)).toEqual(['1', '2']);
  });
});
