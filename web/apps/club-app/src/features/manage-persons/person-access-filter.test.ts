import { describe, expect, it } from 'vitest';
import type { PersonAccessFilter, PersonsEmptyCase } from './person-access-filter';
import {
  parsePersonAccessFilter,
  personsEmptyCaseOf,
  toPersonsRequestPath,
} from './person-access-filter';

describe('parsePersonAccessFilter', () => {
  it.each([
    { value: 'none', expected: 'none' },
    { value: ' Invited ', expected: 'invited' },
    { value: 'NOT-INVITABLE', expected: 'not-invitable' },
    { value: undefined, expected: null },
    { value: '', expected: null },
    { value: 'notInvitable', expected: null },
  ])('reads "$value" as $expected', ({ value, expected }) => {
    expect(parsePersonAccessFilter(value)).toBe(expected);
  });
});

describe('toPersonsRequestPath', () => {
  it.each<{ filter: PersonAccessFilter | null; archived: boolean; expected: string }>([
    { filter: null, archived: false, expected: '/api/manage/persons' },
    { filter: 'invited', archived: false, expected: '/api/manage/persons?access=invited' },
    { filter: null, archived: true, expected: '/api/manage/persons?archived=true' },
    {
      filter: 'with-access',
      archived: true,
      expected: '/api/manage/persons?access=with-access&archived=true',
    },
  ])(
    'asks the register for $filter, archived $archived, at $expected',
    ({ filter, archived, expected }) => {
      expect(toPersonsRequestPath(filter, archived)).toBe(expected);
    },
  );
});

describe('personsEmptyCaseOf', () => {
  it.each<{
    scenario: string;
    query: string;
    state: string;
    access: PersonAccessFilter | null;
    isArchivedView: boolean;
    expected: PersonsEmptyCase;
  }>([
    {
      scenario: 'a query in the archive',
      query: '  Kühn ',
      state: 'all',
      access: null,
      isArchivedView: true,
      expected: { kind: 'archived-query', needle: 'Kühn' },
    },
    {
      scenario: 'an access filter in the archive',
      query: '',
      state: 'all',
      access: 'invited',
      isArchivedView: true,
      expected: { kind: 'archived-filter' },
    },
    {
      scenario: 'an empty archive',
      query: ' ',
      state: 'all',
      access: null,
      isArchivedView: true,
      expected: { kind: 'archived-none' },
    },
    {
      scenario: 'an access filter alone in the default view',
      query: '',
      state: 'all',
      access: 'invited',
      isArchivedView: false,
      expected: { kind: 'access-filter', access: 'invited' },
    },
    {
      scenario: 'an access filter with a query',
      query: 'Kühn',
      state: 'all',
      access: 'invited',
      isArchivedView: false,
      expected: { kind: 'register' },
    },
    {
      scenario: 'an access filter with a state filter',
      query: '',
      state: 'active',
      access: 'invited',
      isArchivedView: false,
      expected: { kind: 'register' },
    },
    {
      scenario: 'no access filter in the default view',
      query: '',
      state: 'all',
      access: null,
      isArchivedView: false,
      expected: { kind: 'register' },
    },
  ])('reads $scenario', ({ query, state, access, isArchivedView, expected }) => {
    expect(personsEmptyCaseOf(query, state, access, isArchivedView)).toEqual(expected);
  });
});
