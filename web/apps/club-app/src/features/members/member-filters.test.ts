import { describe, expect, it } from 'vitest';
import { availableLetters, countByState, filterMembers, groupByLetter } from './member-filters';
import type { MemberSummary } from './schemas';

const member = (
  personId: number,
  firstName: string,
  lastName: string,
  membershipState: MemberSummary['membershipState'],
  groups: string[] = [],
  roles: string[] = [],
): MemberSummary => ({
  personId,
  firstName,
  lastName,
  membershipState,
  groups: groups.map((name, index) => ({ groupId: personId * 10 + index, name })),
  roles: roles.map((name, index) => ({ roleId: personId * 100 + index, name })),
});

const PAULA = member(1, 'Paula', 'Brendel', 'active', ['Tanzgarde'], []);
const KATRIN = member(2, 'Katrin', 'Kühnel', 'paused', ['Elferrat'], ['Präsidentin']);
const JONAS = member(3, 'Jonas', 'Zimmermann', 'none', [], ['Zeugwart']);
const ANNA = member(4, 'Anna', 'Ärtzel', 'ended', ['Musik & Kapelle'], []);
const ALL = [PAULA, KATRIN, JONAS, ANNA];

const idsOf = (members: readonly MemberSummary[]): number[] =>
  members.map((found) => found.personId);

describe('filterMembers', () => {
  it.each([
    { case: 'an empty query keeps everyone', query: '', expected: [1, 2, 3, 4] },
    { case: 'a surname', query: 'brendel', expected: [1] },
    { case: 'a first name', query: 'jonas', expected: [3] },
    { case: 'surname first', query: 'kühnel katrin', expected: [2] },
    { case: 'an umlaut typed without one', query: 'kuhnel', expected: [2] },
    { case: 'an umlaut typed with one', query: 'kühnel', expected: [2] },
    { case: 'a group', query: 'tanzgarde', expected: [1] },
    { case: 'a role', query: 'präsident', expected: [2] },
    { case: 'surrounding blanks', query: '  zimmer  ', expected: [3] },
    { case: 'nothing that matches', query: 'schmidtke', expected: [] },
  ])('matches $case', ({ query, expected }) => {
    expect(idsOf(filterMembers(ALL, { query, state: 'all' }))).toEqual(expected);
  });

  it.each([
    { state: 'all', expected: [1, 2, 3, 4] },
    { state: 'active', expected: [1] },
    { state: 'paused', expected: [2] },
    { state: 'ended', expected: [4] },
    { state: 'none', expected: [3] },
  ])('keeps $state', ({ state, expected }) => {
    expect(idsOf(filterMembers(ALL, { query: '', state }))).toEqual(expected);
  });

  it('applies query and state together', () => {
    expect(idsOf(filterMembers(ALL, { query: 'a', state: 'active' }))).toEqual([1]);
  });
});

describe('countByState', () => {
  it('counts every state, including the ones nobody is in', () => {
    expect(countByState(ALL)).toEqual({ active: 1, paused: 1, ended: 1, none: 1 });
  });

  it('counts an empty list as all zero', () => {
    expect(countByState([])).toEqual({ active: 0, paused: 0, ended: 0, none: 0 });
  });
});

describe('groupByLetter', () => {
  it('keeps the order it was given and buckets by surname initial', () => {
    expect(groupByLetter(ALL).map((section) => [section.letter, idsOf(section.members)])).toEqual([
      ['B', [1]],
      ['K', [2]],
      ['Z', [3]],
      ['A', [4]],
    ]);
  });

  it('collects people under one letter even when they are not neighbours', () => {
    const sections = groupByLetter([PAULA, KATRIN, member(5, 'Bert', 'Bach', 'active')]);

    expect(sections.map((section) => [section.letter, idsOf(section.members)])).toEqual([
      ['B', [1, 5]],
      ['K', [2]],
    ]);
  });

  it('has no sections without members', () => {
    expect(groupByLetter([])).toEqual([]);
  });
});

describe('availableLetters', () => {
  it('offers the whole alphabet and enables only the letters with people', () => {
    const letters = availableLetters(ALL);

    expect(letters).toHaveLength(26);
    expect(letters.filter((entry) => entry.enabled).map((entry) => entry.letter)).toEqual([
      'A',
      'B',
      'K',
      'Z',
    ]);
  });

  it('appends the catch-all cell only when somebody falls into it', () => {
    const letters = availableLetters([member(6, 'Ada', '1899 Hoffenheim', 'active')]);

    expect(letters).toHaveLength(27);
    expect(letters.at(-1)).toEqual({ letter: '#', enabled: true });
  });
});
