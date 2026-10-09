import { describe, expect, it } from 'vitest';
import {
  findMembershipOfPause,
  isContactWithheld,
  membershipPeriodOf,
  registerEmptyCaseOf,
  splitPersonGroups,
  toOpenPause,
} from './manage-persons-labels';
import type { PersonDetails, PersonMembership, PersonSummary } from './schemas';

const person = (overrides: Partial<PersonSummary> & { personId: number }): PersonSummary => ({
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
  accessState: 'none',
  ...overrides,
});

const membership = (overrides: Partial<PersonMembership>): PersonMembership => ({
  membershipId: 1,
  startedOn: '2018-03-01',
  endedOn: null,
  isRunning: true,
  isFuture: false,
  pauses: [],
  admission: null,
  ...overrides,
});

const personDetails = (
  overrides: Partial<PersonDetails> & { personId: number },
): PersonDetails => ({
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
  memberships: [],
  feeReductions: [],
  groups: [],
  roles: [],
  unendedGroupAdminTenures: [],
  unendedBoardSeats: [],
  unendedKeyHoldings: [],
  access: {
    state: 'noAccess',
    reason: null,
    invitation: null,
    history: [],
    rights: { canInvite: true, canManageAccount: false },
    ageOfConsent: 16,
  },
  contactChange: null,
  archive: null,
  ...overrides,
});

describe('isContactWithheld', () => {
  it.each([
    { label: 'nothing on record', row: {}, expected: false },
    { label: 'a phone kept private', row: { phone: '0170 1234' }, expected: true },
    {
      label: 'a phone opted in',
      row: { phone: '0170 1234', contactVisibleToMembers: true },
      expected: false,
    },
    { label: 'an address kept private', row: { zip: '99713', city: 'Großfurra' }, expected: true },
  ])('answers $expected for $label', ({ row, expected }) => {
    expect(isContactWithheld(person({ personId: 1, ...row }))).toBe(expected);
  });
});

describe('registerEmptyCaseOf', () => {
  it.each([
    {
      scenario: 'a query, even with a state filter',
      query: '  Kühn ',
      state: 'paused',
      expected: 'query',
    },
    {
      scenario: 'a state filter hiding everyone',
      query: '',
      state: 'paused',
      expected: 'state-filter',
    },
    { scenario: 'the whole register', query: ' ', state: 'all', expected: 'nobody' },
  ])('reads $scenario as $expected', ({ query, state, expected }) => {
    expect(registerEmptyCaseOf(query, state).kind).toBe(expected);
  });

  it('carries the trimmed query', () => {
    expect(registerEmptyCaseOf('  Kühn ', 'all')).toEqual({ kind: 'query', needle: 'Kühn' });
  });
});

describe('membershipPeriodOf', () => {
  it.each([
    {
      scenario: 'a closed period',
      startedOn: '2009-01-11',
      endedOn: '2016-02-10',
      expected: { kind: 'closed', endedOn: '2016-02-10' },
    },
    {
      scenario: 'a future start',
      startedOn: '2026-10-27',
      endedOn: null,
      expected: { kind: 'upcoming' },
    },
    {
      scenario: 'a start today',
      startedOn: '2026-09-12',
      endedOn: null,
      expected: { kind: 'running' },
    },
    {
      scenario: 'a running period',
      startedOn: '2018-03-01',
      endedOn: null,
      expected: { kind: 'running' },
    },
  ])('reads $scenario', ({ startedOn, endedOn, expected }) => {
    expect(membershipPeriodOf(startedOn, endedOn, '2026-09-12')).toEqual(expected);
  });
});

describe('toOpenPause', () => {
  it.each([
    {
      scenario: 'the one pause without an end',
      pauses: [
        { pauseId: 1, firstSessionYear: 2012, lastSessionYear: 2013 },
        { pauseId: 2, firstSessionYear: 2024, lastSessionYear: null },
      ],
      expected: 2,
    },
    {
      scenario: 'nothing when every pause is closed',
      pauses: [{ pauseId: 1, firstSessionYear: 2012, lastSessionYear: 2013 }],
      expected: null,
    },
  ])('finds $scenario', ({ pauses, expected }) => {
    expect(toOpenPause(membership({ pauses }))?.pauseId ?? null).toBe(expected);
  });
});

describe('splitPersonGroups', () => {
  it('keeps the running rows apart from the closed ones', () => {
    const split = splitPersonGroups([
      { groupId: 1, name: 'Große Garde', joinedOn: '2018-03-01', leftOn: null },
      { groupId: 2, name: 'Elferrat', joinedOn: '2012-01-01', leftOn: '2014-02-01' },
    ]);

    expect({
      running: split.running.map((row) => row.groupId),
      past: split.past.map((row) => row.groupId),
    }).toEqual({ running: [1], past: [2] });
  });
});

describe('findMembershipOfPause', () => {
  it('finds the membership owning a given pause across several periods', () => {
    const found = findMembershipOfPause(
      personDetails({
        personId: 1,
        memberships: [
          membership({ membershipId: 1, pauses: [] }),
          membership({
            membershipId: 2,
            pauses: [{ pauseId: 9, firstSessionYear: 2020, lastSessionYear: null }],
          }),
        ],
      }),
      9,
    );

    expect({ membershipId: found?.membership.membershipId, pauseId: found?.pause.pauseId }).toEqual(
      {
        membershipId: 2,
        pauseId: 9,
      },
    );
  });

  it('answers null when no membership holds that pause', () => {
    expect(
      findMembershipOfPause(personDetails({ personId: 1, memberships: [membership({})] }), 9),
    ).toBeNull();
  });
});
