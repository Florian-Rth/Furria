import { describe, expect, it } from 'vitest';
import {
  holderPhaseOf,
  isFullSet,
  primaryActionOf,
  toActiveRoles,
  toArchivedRoles,
  toEditorLanding,
  toHolderGroups,
  toHolderPreview,
  toPastHolders,
  toRightEntries,
  toRightGroups,
  toRoleMarkState,
  toTabState,
} from './roles-hub';
import type { RoleHolder, RoleSummary } from './schemas';

const role = (roleId: number, overrides: Partial<RoleSummary> = {}): RoleSummary => ({
  roleId,
  name: `Rolle ${String(roleId).padStart(2, '0')}`,
  description: '',
  coin: null,
  archivedOn: null,
  permissionKeys: ['groups.manage'],
  holders: [{ personId: roleId, firstName: 'Vor', lastName: 'Name' }],
  impliedBy: [],
  ...overrides,
});

const holder = (roleHoldingId: number, sinceOn: string, untilOn: string | null): RoleHolder => ({
  roleHoldingId,
  personId: roleHoldingId,
  firstName: 'Vor',
  lastName: `Name${roleHoldingId}`,
  sinceOn,
  untilOn,
  since: sinceOn,
  isAffiliated: true,
  honours: { sessions: 0, functions: [] },
});

const TODAY = '2026-10-20';

describe('toRoleMarkState', () => {
  it.each([
    { overrides: { archivedOn: '2026-09-01' }, expected: 'archived' },
    { overrides: { holders: [] }, expected: 'active' },
  ])('marks $overrides as $expected', ({ overrides, expected }) => {
    expect(toRoleMarkState(role(1, overrides))).toBe(expected);
  });
});

describe('isFullSet', () => {
  it.each([
    { granted: 3, total: 3, expected: true },
    { granted: 2, total: 3, expected: false },
    { granted: 0, total: 0, expected: false },
  ])('is $expected for $granted of $total', ({ granted, total, expected }) => {
    const keys = Array.from({ length: granted }, (_, index) => `key-${index}`);

    expect(isFullSet(role(1, { permissionKeys: keys }), total)).toBe(expected);
  });
});

describe('role lists', () => {
  const roles = [
    role(1, { name: 'Zeugwart' }),
    role(2, { name: 'Kasse' }),
    role(4, { name: 'Alt', archivedOn: '2026-01-01' }),
    role(5, { name: 'Ärzte' }),
  ];

  it('lists the active roles alphabetically', () => {
    expect(toActiveRoles(roles).map((entry) => entry.roleId)).toEqual([5, 2, 1]);
  });

  it('lists archived roles apart', () => {
    expect(toArchivedRoles(roles).map((entry) => entry.roleId)).toEqual([4]);
  });
});

describe('toHolderPreview', () => {
  it.each([
    { count: 0, shown: 0, more: 0 },
    { count: 2, shown: 2, more: 0 },
    { count: 5, shown: 2, more: 3 },
  ])('shows $shown of $count holders and counts $more more', ({ count, shown, more }) => {
    const holders = Array.from({ length: count }, (_, index) => index);

    expect(toHolderPreview(holders)).toEqual({ shown: holders.slice(0, shown), more });
  });
});

describe('toRightEntries', () => {
  it('lists the active roles granting each known right in catalogue order', () => {
    const roles = [
      role(1, { name: 'Kasse', permissionKeys: ['roles.manage'] }),
      role(2, { name: 'Admin', permissionKeys: ['roles.manage', 'groups.manage'] }),
      role(3, { name: 'Alt', permissionKeys: ['roles.manage'], archivedOn: '2026-01-01' }),
    ];

    const entries = toRightEntries(roles, ['roles.manage', 'unknown.key', 'groups.manage']);

    expect(
      entries.map((entry) => [entry.key, entry.roles.map((granting) => granting.roleId)]),
    ).toEqual([
      ['roles.manage', [2, 1]],
      ['groups.manage', [2]],
    ]);
  });
});

describe('toRightGroups', () => {
  const entries = toRightEntries(
    [role(1, { permissionKeys: [] })],
    ['groups.manage', 'roles.manage', 'news.manage', 'system.view'],
  );

  it('sorts the rights into their groups and keeps the unknown ones apart', () => {
    const groups = toRightGroups(entries, [
      { id: 'club', keys: ['groups.manage', 'roles.manage'] },
      { id: 'empty', keys: ['events.manage'] },
      { id: 'media', keys: ['news.manage'] },
    ]);

    expect(groups.map((group) => [group.id, group.entries.length])).toEqual([
      ['club', 2],
      ['media', 1],
      ['other', 1],
    ]);
  });
});

describe('holderPhaseOf', () => {
  it.each([
    { sinceOn: '2026-01-01', untilOn: null, expected: 'running' },
    { sinceOn: '2026-01-01', untilOn: '2026-12-31', expected: 'ending' },
    { sinceOn: '2026-11-01', untilOn: null, expected: 'planned' },
    { sinceOn: '2025-01-01', untilOn: '2026-10-19', expected: 'past' },
    { sinceOn: '2025-01-01', untilOn: TODAY, expected: 'ending' },
  ])('reads $sinceOn to $untilOn as $expected', ({ sinceOn, untilOn, expected }) => {
    expect(holderPhaseOf({ sinceOn, untilOn }, TODAY)).toBe(expected);
  });
});

describe('toHolderGroups', () => {
  it('splits running from planned holders, each by start', () => {
    const groups = toHolderGroups(
      [
        holder(1, '2026-11-15', null),
        holder(2, '2026-03-01', null),
        holder(3, '2025-03-01', '2026-12-31'),
        holder(4, '2026-11-01', null),
      ],
      TODAY,
    );

    expect(groups.current.map((entry) => entry.roleHoldingId)).toEqual([3, 2]);
    expect(groups.planned.map((entry) => entry.roleHoldingId)).toEqual([4, 1]);
  });
});

describe('toPastHolders', () => {
  it('puts the latest ending first', () => {
    const past = toPastHolders([
      holder(1, '2018-01-01', '2019-12-31'),
      holder(2, '2020-01-01', '2024-06-30'),
    ]);

    expect(past.map((entry) => entry.roleHoldingId)).toEqual([2, 1]);
  });
});

describe('toTabState', () => {
  it.each([
    { tab: 'holders' as const, overrides: {}, expected: 'open' },
    { tab: 'holders' as const, overrides: { archivedOn: '2026-01-01' }, expected: 'off' },
    { tab: 'rights' as const, overrides: { permissionKeys: [] }, expected: 'open' },
    { tab: 'rights' as const, overrides: {}, expected: 'done' },
    { tab: 'rights' as const, overrides: { archivedOn: '2026-01-01' }, expected: 'off' },
    { tab: 'settings' as const, overrides: { archivedOn: '2026-01-01' }, expected: 'open' },
  ])('marks $tab as $expected', ({ tab, overrides, expected }) => {
    expect(toTabState(tab, role(1, overrides))).toBe(expected);
  });
});

describe('primaryActionOf', () => {
  it.each([
    { tab: 'holders' as const, overrides: {}, expected: 'addHolder' },
    { tab: 'settings' as const, overrides: {}, expected: 'edit' },
    { tab: 'rights' as const, overrides: {}, expected: null },
    { tab: 'holders' as const, overrides: { archivedOn: '2026-01-01' }, expected: null },
  ])('answers $expected on $tab', ({ tab, overrides, expected }) => {
    expect(primaryActionOf(tab, role(1, overrides))).toBe(expected);
  });
});

describe('toEditorLanding', () => {
  it.each([
    { returnTo: 'role' as const, to: '/manage/roles/$roleId' },
    { returnTo: 'hub' as const, to: '/manage/roles' },
    { returnTo: 'new' as const, to: '/manage/roles' },
  ])('lands on $to after $returnTo', ({ returnTo, to }) => {
    expect(toEditorLanding(7, returnTo)).toMatchObject({ to, mark: { kind: 'role', id: 7 } });
  });

  it('opens the pane of the role on the hub', () => {
    expect(toEditorLanding(7, 'hub').search).toEqual({ role: 7 });
  });
});
