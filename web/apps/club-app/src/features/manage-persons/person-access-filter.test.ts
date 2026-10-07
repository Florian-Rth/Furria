import { describe, expect, it } from 'vitest';
import { toMembershipStateChip } from '@/lib/state-chips';
import type { PersonAccessFilter } from './person-access-filter';
import {
  parsePersonAccessFilter,
  toNoAccessMatchLine,
  toPersonRowChip,
  toPersonsEmptyLine,
  toPersonsRequestPath,
  toRegisterAccessChip,
} from './person-access-filter';
import type { PersonSummary } from './schemas';

describe('parsePersonAccessFilter', () => {
  it.each([
    { value: 'none', expected: 'none' },
    { value: 'invited', expected: 'invited' },
    { value: 'active', expected: 'active' },
    { value: 'disabled', expected: 'disabled' },
    { value: 'not-invitable', expected: 'not-invitable' },
    { value: 'with-access', expected: 'with-access' },
    { value: 'open-invitation', expected: 'open-invitation' },
    { value: 'without-email', expected: 'without-email' },
    { value: 'birth-date-unknown', expected: 'birth-date-unknown' },
    { value: ' Invited ', expected: 'invited' },
    { value: 'NOT-INVITABLE', expected: 'not-invitable' },
    { value: 'Birth-Date-Unknown', expected: 'birth-date-unknown' },
  ])('reads "$value" as the $expected filter', ({ value, expected }) => {
    expect(parsePersonAccessFilter(value)).toBe(expected);
  });

  it.each([
    { value: undefined },
    { value: '' },
    { value: 'everyone' },
    { value: 'notInvitable' },
    { value: 'birthDateUnknown' },
  ])('reads $value as no filter', ({ value }) => {
    expect(parsePersonAccessFilter(value)).toBeNull();
  });
});

describe('toPersonsRequestPath', () => {
  it.each<{ filter: PersonAccessFilter | null; archived: boolean; expected: string }>([
    { filter: null, archived: false, expected: '/api/manage/persons' },
    { filter: 'invited', archived: false, expected: '/api/manage/persons?access=invited' },
    {
      filter: 'not-invitable',
      archived: false,
      expected: '/api/manage/persons?access=not-invitable',
    },
    {
      filter: 'birth-date-unknown',
      archived: false,
      expected: '/api/manage/persons?access=birth-date-unknown',
    },
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

describe('toPersonRowChip', () => {
  const person: PersonSummary = {
    personId: 7,
    firstName: 'Bea',
    lastName: 'Berg',
    email: null,
    phone: null,
    street: null,
    zip: null,
    city: null,
    birthDate: null,
    contactVisibleToMembers: false,
    membershipState: 'active',
    memberSince: '2019-09-01',
    groups: [],
    roles: [],
    accessState: 'disabled',
  };

  it('shows the membership while no access filter is on', () => {
    expect(toPersonRowChip(person, null)).toEqual(toMembershipStateChip('active'));
  });

  it.each<{ access: PersonAccessFilter }>([
    { access: 'disabled' },
    { access: 'with-access' },
    { access: 'without-email' },
    { access: 'birth-date-unknown' },
  ])('shows her access state while the $access filter is on', ({ access }) => {
    expect(toPersonRowChip(person, access)).toEqual(toRegisterAccessChip('disabled'));
  });

  it('never reads an active account like an active membership', () => {
    const activeAccount = toPersonRowChip({ ...person, accessState: 'active' }, 'active');

    expect(activeAccount.label).not.toBe(toMembershipStateChip('active').label);
  });
});

describe('toPersonsEmptyLine', () => {
  it('quotes the query that found no archived person', () => {
    expect(toPersonsEmptyLine('  Kühn ', 'all', null, true)).toContain('„Kühn“');
  });

  it('never blames the access filter for an empty archive', () => {
    expect(toPersonsEmptyLine('', 'all', 'invited', true)).not.toBe(toNoAccessMatchLine('invited'));
  });

  it('blames the access filter in the default view', () => {
    expect(toPersonsEmptyLine('', 'all', 'invited', false)).toBe(toNoAccessMatchLine('invited'));
  });
});
