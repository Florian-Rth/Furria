import { describe, expect, it } from 'vitest';
import {
  availablePersonLetters,
  countPersonsByState,
  filterPersons,
  groupPersonsByLetter,
} from './person-filters';
import type { PersonSummary } from './schemas';

const person = (overrides: Partial<PersonSummary> & { personId: number }): PersonSummary => ({
  firstName: 'Anna',
  lastName: 'Adam',
  email: null,
  phone: null,
  street: null,
  zip: null,
  city: null,
  birthDate: null,
  contactVisibleToMembers: false,
  membershipState: 'active',
  memberSince: null,
  groups: [],
  roles: [],
  ...overrides,
});

describe('filterPersons', () => {
  const kuehnel = person({ personId: 1, firstName: 'Birgit', lastName: 'Kühnel' });
  const oehler = person({
    personId: 2,
    firstName: 'Dorothea',
    lastName: 'Oehler',
    street: 'Hauptstraße 12',
    zip: '99713',
    city: 'Großfurra',
    membershipState: 'none',
  });
  const zoeller = person({
    personId: 3,
    firstName: 'Franziska',
    lastName: 'Zöller',
    email: 'franziska@example.org',
    membershipState: 'ended',
  });
  const persons = [kuehnel, oehler, zoeller];

  it.each([
    { query: 'kuhnel', expected: [1] },
    { query: 'KÜHNEL', expected: [1] },
    { query: 'kuehnel', expected: [] },
    { query: 'hauptstrasse', expected: [2] },
    { query: '99713 Grossfurra', expected: [2] },
    { query: 'franziska@example.org', expected: [3] },
    { query: 'Oehler Dorothea', expected: [2] },
    { query: '  ', expected: [1, 2, 3] },
    { query: 'Elferrat', expected: [] },
  ])('matches $query against $expected', ({ query, expected }) => {
    expect(filterPersons(persons, { query, state: 'all' }).map((row) => row.personId)).toEqual(
      expected,
    );
  });

  it('narrows to one state while keeping the query', () => {
    const result = filterPersons(persons, { query: '', state: 'none' });

    expect(result.map((row) => row.personId)).toEqual([2]);
  });
});

describe('countPersonsByState', () => {
  it('counts every state, including the ones nobody holds', () => {
    const counts = countPersonsByState([
      person({ personId: 1, membershipState: 'active' }),
      person({ personId: 2, membershipState: 'active' }),
      person({ personId: 3, membershipState: 'ended' }),
    ]);

    expect(counts).toEqual({ active: 2, paused: 0, ended: 1, none: 0 });
  });
});

describe('groupPersonsByLetter', () => {
  it('folds umlauts into their base letter and keeps the payload order', () => {
    const sections = groupPersonsByLetter([
      person({ personId: 1, lastName: 'Adam' }),
      person({ personId: 2, lastName: 'Ärger' }),
      person({ personId: 3, lastName: 'Öhler' }),
      person({ personId: 4, lastName: 'Oehler' }),
    ]);

    expect(
      sections.map((section) => ({
        letter: section.letter,
        ids: section.persons.map((row) => row.personId),
      })),
    ).toEqual([
      { letter: 'A', ids: [1, 2] },
      { letter: 'O', ids: [3, 4] },
    ]);
  });

  it('buckets a name that starts with no latin letter under the other divider', () => {
    const sections = groupPersonsByLetter([person({ personId: 1, lastName: '8-Bit' })]);

    expect(sections.map((section) => section.letter)).toEqual(['#']);
  });
});

describe('availablePersonLetters', () => {
  it('enables only the letters present and appends the other cell last', () => {
    const letters = availablePersonLetters([
      person({ personId: 1, lastName: 'Ärger' }),
      person({ personId: 2, lastName: '8-Bit' }),
    ]);

    expect(letters).toHaveLength(27);
    expect(letters.filter((cell) => cell.enabled).map((cell) => cell.letter)).toEqual(['A', '#']);
  });
});
