import { describe, expect, it } from 'vitest';
import type { PersonAccessFilter } from './person-access-filter';
import { nextAppFilter, toAppFilterValue, toAppStats } from './person-app-state';
import type { PersonSummary, RegisterAccessState } from './schemas';

const person = (personId: number, accessState: RegisterAccessState): PersonSummary => ({
  personId,
  firstName: 'Anna',
  lastName: 'Adam',
  portrait: null,
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
  accessState,
  feeReduced: false,
});

describe('toAppFilterValue', () => {
  it.each<{ filter: PersonAccessFilter | null; expected: string }>([
    { filter: null, expected: '' },
    { filter: 'invited', expected: 'invited' },
    { filter: 'not-invitable', expected: 'not-invitable' },
    { filter: 'without-email', expected: '' },
    { filter: 'birth-date-unknown', expected: '' },
  ])('selects "$expected" for the $filter filter', ({ filter, expected }) => {
    expect(toAppFilterValue(filter)).toBe(expected);
  });
});

describe('nextAppFilter', () => {
  it.each<{
    current: PersonAccessFilter | null;
    chosenId: string;
    expected: PersonAccessFilter | null;
  }>([
    { current: null, chosenId: 'invited', expected: 'invited' },
    { current: 'none', chosenId: 'invited', expected: 'invited' },
    { current: 'invited', chosenId: 'invited', expected: null },
    { current: 'without-email', chosenId: 'active', expected: 'active' },
    { current: 'active', chosenId: 'unknown', expected: null },
  ])('moves from $current to $expected on $chosenId', ({ current, chosenId, expected }) => {
    expect(nextAppFilter(current, chosenId)).toBe(expected);
  });
});

describe('toAppStats', () => {
  it('counts persons with the app and with an open invitation, leaving out empty counts', () => {
    const stats = toAppStats([
      person(1, 'active'),
      person(2, 'active'),
      person(3, 'none'),
      person(4, 'disabled'),
      person(5, 'notInvitable'),
    ]);

    expect(stats.map((stat) => ({ key: stat.key, count: stat.count }))).toEqual([
      { key: 'active', count: 2 },
    ]);
  });

  it('keeps the app count ahead of the invitation count', () => {
    const stats = toAppStats([person(1, 'invited'), person(2, 'active'), person(3, 'invited')]);

    expect(stats.map((stat) => ({ key: stat.key, count: stat.count }))).toEqual([
      { key: 'active', count: 1 },
      { key: 'invited', count: 2 },
    ]);
  });
});
