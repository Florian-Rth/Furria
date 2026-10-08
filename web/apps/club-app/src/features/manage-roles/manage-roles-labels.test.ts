import { describe, expect, it } from 'vitest';
import type { PersonRef } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import type { SelfLockoutInput } from './manage-roles-labels';
import {
  ACTIVE_ROLES_FILTER_ID,
  ALL_ROLES_FILTER_ID,
  ARCHIVED_ROLES_FILTER_ID,
  isPermissionHandover,
  isSelfLockout,
  noRoleMatchCaseOf,
  toEndQuickChoices,
  toMasterEntries,
  toNextPermissionKeys,
  toPermissionEntries,
  toRoleHoldingChainRows,
  toRoleSearchTerm,
  toRoleSeed,
  toRoleStatusFilterOptions,
  toStartQuickChoices,
} from './manage-roles-labels';
import type { RoleDetails, RoleHolder, RoleSummary } from './schemas';

const role = (overrides: Partial<RoleSummary> & { roleId: number; name: string }): RoleSummary => ({
  description: '',
  archivedOn: null,
  permissionKeys: [],
  holders: [],
  ...overrides,
});

describe('toRoleSearchTerm', () => {
  it.each([
    ['   ', null],
    ['  Kasse ', 'Kasse'],
  ])('maps %j to %j', (raw, expected) => {
    expect(toRoleSearchTerm(raw)).toBe(expected);
  });
});

describe('toMasterEntries', () => {
  const roles: readonly RoleSummary[] = [
    role({ roleId: 1, name: 'Admin' }),
    role({ roleId: 9, name: 'Pressewartin', archivedOn: '2026-09-12' }),
    role({
      roleId: 3,
      name: 'Finanzen',
      description: 'Führt die Kasse und die Beiträge.',
      holders: [{ personId: 4, firstName: 'Lukas', lastName: 'Schmitt' }],
    }),
  ];

  const ids = (query: string, status: string): number[] =>
    toMasterEntries(roles, query, status).map((entry) => entry.roleId);

  it('keeps the server order but moves archived roles last', () => {
    expect(ids('', ALL_ROLES_FILTER_ID)).toEqual([1, 3, 9]);
  });

  it('folds umlauts when matching the name', () => {
    expect(ids('pressewartin', ALL_ROLES_FILTER_ID)).toEqual([9]);
  });

  it('matches the description as well as the name', () => {
    expect(ids('kasse', ALL_ROLES_FILTER_ID)).toEqual([3]);
  });

  it('requires every word of the query to match', () => {
    expect(toMasterEntries(roles, 'kasse beitraege', ALL_ROLES_FILTER_ID)).toEqual([]);
    expect(ids('kasse beitrage', ALL_ROLES_FILTER_ID)).toEqual([3]);
  });

  it('drops the archived role under the in-use filter', () => {
    expect(ids('', ACTIVE_ROLES_FILTER_ID)).toEqual([1, 3]);
  });

  it('keeps only the archived role under the archived filter', () => {
    expect(ids('', ARCHIVED_ROLES_FILTER_ID)).toEqual([9]);
  });

  it('applies the query inside the chosen status', () => {
    expect(ids('pressewartin', ACTIVE_ROLES_FILTER_ID)).toEqual([]);
  });
});

describe('toRoleStatusFilterOptions', () => {
  const roles: readonly RoleSummary[] = [
    role({ roleId: 1, name: 'Admin' }),
    role({ roleId: 9, name: 'Pressewartin', archivedOn: '2026-09-12' }),
    role({ roleId: 3, name: 'Finanzen' }),
  ];

  it('counts every role, the ones in the club and the archived ones', () => {
    expect(toRoleStatusFilterOptions(roles).map((option) => [option.id, option.count])).toEqual([
      [ALL_ROLES_FILTER_ID, 3],
      [ACTIVE_ROLES_FILTER_ID, 2],
      [ARCHIVED_ROLES_FILTER_ID, 1],
    ]);
  });
});

describe('noRoleMatchCaseOf', () => {
  it.each([
    {
      scenario: 'a query under a status',
      query: '  Kasse ',
      status: ARCHIVED_ROLES_FILTER_ID,
      expected: 'query',
    },
    {
      scenario: 'the archived chip alone',
      query: '',
      status: ARCHIVED_ROLES_FILTER_ID,
      expected: 'status',
    },
    {
      scenario: 'the non-archived chip alone',
      query: '',
      status: ACTIVE_ROLES_FILTER_ID,
      expected: 'status',
    },
    { scenario: 'Alle', query: ' ', status: ALL_ROLES_FILTER_ID, expected: 'cold' },
  ])('reads $scenario as $expected', ({ query, status, expected }) => {
    expect(noRoleMatchCaseOf(query, status).kind).toBe(expected);
  });

  it('carries the trimmed query', () => {
    expect(noRoleMatchCaseOf('  Kasse ', ALL_ROLES_FILTER_ID)).toEqual({
      kind: 'query',
      term: 'Kasse',
    });
  });
});

describe('toPermissionEntries', () => {
  it('follows the catalogue order and drops unknown keys', () => {
    const entries = toPermissionEntries(
      [PERMISSION_KEYS.groupsManage, 'drinks.manage', PERMISSION_KEYS.personsManage],
      [PERMISSION_KEYS.personsManage],
    );

    expect(entries.map((entry) => entry.key)).toEqual([
      PERMISSION_KEYS.groupsManage,
      PERMISSION_KEYS.personsManage,
    ]);
    expect(entries.map((entry) => entry.enabled)).toEqual([false, true]);
  });
});

describe('toNextPermissionKeys', () => {
  it('adds a missing key', () => {
    expect(
      toNextPermissionKeys([PERMISSION_KEYS.groupsManage], PERMISSION_KEYS.rolesManage, true),
    ).toEqual([PERMISSION_KEYS.groupsManage, PERMISSION_KEYS.rolesManage]);
  });

  it('removes a held key', () => {
    expect(
      toNextPermissionKeys(
        [PERMISSION_KEYS.groupsManage, PERMISSION_KEYS.rolesManage],
        PERMISSION_KEYS.rolesManage,
        false,
      ),
    ).toEqual([PERMISSION_KEYS.groupsManage]);
  });

  it('never sends a key twice', () => {
    expect(
      toNextPermissionKeys(
        [PERMISSION_KEYS.rolesManage, PERMISSION_KEYS.rolesManage],
        PERMISSION_KEYS.rolesManage,
        true,
      ),
    ).toEqual([PERMISSION_KEYS.rolesManage]);
  });
});

describe('toRoleSeed', () => {
  const roles = {
    roles: [role({ roleId: 2, name: 'Präsidentin', permissionKeys: ['groups.manage'] })],
    permissionKeys: ['groups.manage'],
  };

  it('seeds the detail from the matching list row', () => {
    expect(toRoleSeed(roles, 2)).toEqual({
      roleId: 2,
      name: 'Präsidentin',
      description: '',
      archivedOn: null,
      permissionKeys: ['groups.manage'],
      holders: [],
      pastHolders: [],
    });
  });

  it.each([
    ['an unknown role', roles, 99],
    ['no selection', roles, null],
  ])('yields nothing for %s', (_case, list, roleId) => {
    expect(toRoleSeed(list, roleId)).toBeUndefined();
  });

  it('yields nothing before the list has loaded', () => {
    expect(toRoleSeed(undefined, 2)).toBeUndefined();
  });
});

describe('isSelfLockout', () => {
  const VIEWER = 7;
  const KEY = PERMISSION_KEYS.rolesManage;

  const holder = (personId: number): PersonRef => ({
    personId,
    firstName: 'Heike',
    lastName: 'Krämer',
  });

  const president = role({
    roleId: 1,
    name: 'Präsidentin',
    permissionKeys: [KEY],
    holders: [holder(VIEWER)],
  });

  const input = (overrides: Partial<SelfLockoutInput> = {}): SelfLockoutInput => ({
    key: KEY,
    enabled: false,
    roleId: 1,
    viewerPersonId: VIEWER,
    roles: [president],
    ...overrides,
  });

  it('warns when the only role that grants her the key is losing it', () => {
    expect(isSelfLockout(input())).toBe(true);
  });

  it('stays quiet when a second role she holds still grants the key', () => {
    const admin = role({
      roleId: 2,
      name: 'Admin',
      permissionKeys: [KEY],
      holders: [holder(VIEWER)],
    });

    expect(isSelfLockout(input({ roles: [president, admin] }))).toBe(false);
  });

  it('warns when the second role that grants the key is archived', () => {
    const archivedAdmin = role({
      roleId: 2,
      name: 'Admin',
      archivedOn: '2026-09-12',
      permissionKeys: [KEY],
      holders: [holder(VIEWER)],
    });

    expect(isSelfLockout(input({ roles: [president, archivedAdmin] }))).toBe(true);
  });

  it('warns when the second role grants the key to somebody else', () => {
    const admin = role({
      roleId: 2,
      name: 'Admin',
      permissionKeys: [KEY],
      holders: [holder(99)],
    });

    expect(isSelfLockout(input({ roles: [president, admin] }))).toBe(true);
  });

  it('warns when the second role she holds grants another key', () => {
    const treasurer = role({
      roleId: 2,
      name: 'Finanzen',
      permissionKeys: [PERMISSION_KEYS.groupsManage],
      holders: [holder(VIEWER)],
    });

    expect(isSelfLockout(input({ roles: [president, treasurer] }))).toBe(true);
  });

  it('stays quiet when the switch is going on', () => {
    expect(isSelfLockout(input({ enabled: true }))).toBe(false);
  });

  it('stays quiet when the viewer does not hold the edited role', () => {
    const heldByAnother = role({
      roleId: 1,
      name: 'Präsidentin',
      permissionKeys: [KEY],
      holders: [holder(99)],
    });

    expect(isSelfLockout(input({ roles: [heldByAnother] }))).toBe(false);
  });

  it('stays quiet when the edited role never granted the key', () => {
    const withoutTheKey = role({
      roleId: 1,
      name: 'Präsidentin',
      holders: [holder(VIEWER)],
    });

    expect(isSelfLockout(input({ roles: [withoutTheKey] }))).toBe(false);
  });

  it('stays quiet while the viewer is still unknown', () => {
    expect(isSelfLockout(input({ viewerPersonId: undefined }))).toBe(false);
  });
});

describe('isPermissionHandover', () => {
  it.each([
    {
      case: 'switching the rights permission on',
      input: { key: PERMISSION_KEYS.rolesManage, enabled: true },
      expected: true,
    },
    {
      case: 'switching the rights permission off',
      input: { key: PERMISSION_KEYS.rolesManage, enabled: false },
      expected: false,
    },
    {
      case: 'switching another permission on',
      input: { key: PERMISSION_KEYS.groupsManage, enabled: true },
      expected: false,
    },
  ])('is $expected when $case', ({ input, expected }) => {
    expect(isPermissionHandover(input)).toBe(expected);
  });
});

describe('toRoleHoldingChainRows', () => {
  const holder = (overrides: Partial<RoleHolder> & { roleHoldingId: number }): RoleHolder => ({
    personId: 4,
    firstName: 'Lukas',
    lastName: 'Schmitt',
    sinceOn: '2020-01-01',
    untilOn: null,
    since: '2020-01-01',
    isAffiliated: true,
    ...overrides,
  });

  const details = (overrides: Partial<RoleDetails> = {}): RoleDetails => ({
    roleId: 3,
    name: 'Finanzen',
    description: '',
    archivedOn: null,
    permissionKeys: [],
    holders: [],
    pastHolders: [],
    ...overrides,
  });

  it('keeps only the picked person, running before past', () => {
    const role = details({
      holders: [
        holder({ roleHoldingId: 1, personId: 4 }),
        holder({ roleHoldingId: 2, personId: 9 }),
      ],
      pastHolders: [holder({ roleHoldingId: 3, personId: 4, untilOn: '2019-12-31' })],
    });

    expect(toRoleHoldingChainRows(role, 4, null).map((row) => row.key)).toEqual(['1', '3']);
  });
});

describe('quick choices', () => {
  const valuesOf = (choices: readonly { value: string | null }[]): (string | null)[] =>
    choices.map((choice) => choice.value);

  it.each([
    {
      scenario: 'the opening of the running session',
      today: new Date(2026, 8, 12),
      expected: ['2026-09-12', '2025-11-11'],
    },
    {
      scenario: 'today only on the opening day',
      today: new Date(2026, 10, 11),
      expected: ['2026-11-11'],
    },
  ])('starts with today and $scenario', ({ today, expected }) => {
    expect(valuesOf(toStartQuickChoices(today))).toEqual(expected);
  });

  it.each([
    {
      scenario: 'the last day of the running session',
      today: new Date(2026, 8, 12),
      expected: ['2026-09-12', '2026-11-10'],
    },
    {
      scenario: 'today only on the closing day',
      today: new Date(2026, 10, 10),
      expected: ['2026-11-10'],
    },
  ])('ends with today and $scenario', ({ today, expected }) => {
    expect(valuesOf(toEndQuickChoices(today))).toEqual(expected);
  });
});
