import { describe, expect, it } from 'vitest';
import { toMembershipStateChip } from '@/lib/state-chips';
import type { PersonAccessFilter } from './person-access-filter';
import {
  parsePersonAccessFilter,
  toPersonRowChip,
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
  it.each([
    { filter: null, expected: '/api/manage/persons' },
    { filter: 'invited' as const, expected: '/api/manage/persons?access=invited' },
    { filter: 'not-invitable' as const, expected: '/api/manage/persons?access=not-invitable' },
    {
      filter: 'birth-date-unknown' as const,
      expected: '/api/manage/persons?access=birth-date-unknown',
    },
  ])('asks the register for $filter at $expected', ({ filter, expected }) => {
    expect(toPersonsRequestPath(filter)).toBe(expected);
  });
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
