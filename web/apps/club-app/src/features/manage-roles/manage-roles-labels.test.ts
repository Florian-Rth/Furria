import { describe, expect, it } from 'vitest';
import type { PersonRef } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import type { SelfLockoutInput } from './manage-roles-labels';
import { isPermissionHandover, isSelfLockout, toNextPermissionKeys } from './manage-roles-labels';
import type { RoleSummary } from './schemas';

const role = (overrides: Partial<RoleSummary> & { roleId: number; name: string }): RoleSummary => ({
  description: '',
  coin: null,
  archivedOn: null,
  permissionKeys: [],
  holders: [],
  impliedBy: [],
  ...overrides,
});

describe('toNextPermissionKeys', () => {
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

  it('stays quiet when the viewer does not hold the edited role', () => {
    const heldByAnother = role({
      roleId: 1,
      name: 'Präsidentin',
      permissionKeys: [KEY],
      holders: [holder(99)],
    });

    expect(isSelfLockout(input({ roles: [heldByAnother] }))).toBe(false);
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
      case: 'switching another permission on',
      input: { key: PERMISSION_KEYS.groupsManage, enabled: true },
      expected: false,
    },
  ])('is $expected when $case', ({ input, expected }) => {
    expect(isPermissionHandover(input)).toBe(expected);
  });
});
