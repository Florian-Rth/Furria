import { describe, expect, it } from 'vitest';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import {
  ACTIVE_ROLES_FILTER_ID,
  ALL_ROLES_FILTER_ID,
  ARCHIVED_ROLES_FILTER_ID,
  isKeyHandover,
  isSelfLockout,
  toArchivedMeta,
  toEndHoldingConsequence,
  toEndQuickChoices,
  toHolderAddedMessage,
  toHolderCountLabel,
  toHoldersMeta,
  toHolderUnitLabel,
  toHoldingEndedMessage,
  toMasterEntries,
  toNextPermissionKeys,
  toNoRoleMatchLine,
  toPermissionEntries,
  toRoleSearchTerm,
  toRoleSeed,
  toRoleStatusFilterOptions,
  toRolesLead,
  toStartQuickChoices,
} from './manage-roles-labels';
import type { RoleSummary } from './schemas';

const role = (overrides: Partial<RoleSummary> & { roleId: number; name: string }): RoleSummary => ({
  description: '',
  archivedOn: null,
  permissionKeys: [],
  holders: [],
  ...overrides,
});

describe('toRoleSearchTerm', () => {
  it.each([
    ['', null],
    ['   ', null],
    ['  Kasse ', 'Kasse'],
  ])('maps %j to %j', (raw, expected) => {
    expect(toRoleSearchTerm(raw)).toBe(expected);
  });
});

describe('toHoldersMeta', () => {
  it('says nothing about an unheld role — the chip carries that', () => {
    expect(toHoldersMeta([])).toBeNull();
  });

  it('names the single holder', () => {
    expect(toHoldersMeta([{ firstName: 'Heike', lastName: 'Krämer' }])).toBe('Heike Krämer');
  });

  it('names the noun for a single further holder', () => {
    expect(
      toHoldersMeta([
        { firstName: 'Jörg', lastName: 'Krüger' },
        { firstName: 'Heike', lastName: 'Krämer' },
      ]),
    ).toBe('Jörg Krüger und eine weitere Person');
  });

  it('names the noun for several further holders too', () => {
    expect(
      toHoldersMeta([
        { firstName: 'Heike', lastName: 'Krämer' },
        { firstName: 'Jörg', lastName: 'Krüger' },
        { firstName: 'Lukas', lastName: 'Schmitt' },
      ]),
    ).toBe('Heike Krämer und 2 weitere Personen');
  });
});

describe('toRolesLead', () => {
  it('counts the live Rollen', () => {
    expect(
      toRolesLead([role({ roleId: 1, name: 'Admin' }), role({ roleId: 2, name: 'Kasse' })]),
    ).toBe('2 Rollen sagen, wer im Verein was darf.');
  });

  it('reads a single Rolle in the singular', () => {
    expect(toRolesLead([role({ roleId: 1, name: 'Admin' })])).toBe(
      'Eine Rolle sagt, wer im Verein was darf.',
    );
  });

  it('counts the archived Rollen separately', () => {
    expect(
      toRolesLead([
        role({ roleId: 1, name: 'Admin' }),
        role({ roleId: 9, name: 'Chronistin', archivedOn: '2026-09-12' }),
      ]),
    ).toBe('Eine Rolle sagt, wer im Verein was darf. Eine weitere ist archiviert.');
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

  it('marks the archived row', () => {
    const archived = toMasterEntries(roles, '', ALL_ROLES_FILTER_ID).find(
      (entry) => entry.roleId === 9,
    );

    expect(archived?.isArchived).toBe(true);
  });

  it('marks a row nobody holds', () => {
    const unheld = toMasterEntries(roles, '', ALL_ROLES_FILTER_ID).find(
      (entry) => entry.roleId === 1,
    );

    expect(unheld?.isUnheld).toBe(true);
  });

  it('carries the holder count the card paints as its numeral', () => {
    const held = toMasterEntries(roles, '', ALL_ROLES_FILTER_ID).find(
      (entry) => entry.roleId === 3,
    );

    expect(held?.holderCount).toBe(1);
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

  it('counts every role, the ones in use and the archived ones', () => {
    expect(toRoleStatusFilterOptions(roles).map((option) => [option.id, option.count])).toEqual([
      [ALL_ROLES_FILTER_ID, 3],
      [ACTIVE_ROLES_FILTER_ID, 2],
      [ARCHIVED_ROLES_FILTER_ID, 1],
    ]);
  });

  it('offers the axis even when nothing is archived', () => {
    expect(toRoleStatusFilterOptions([role({ roleId: 1, name: 'Admin' })])).toHaveLength(3);
  });
});

describe('toNoRoleMatchLine', () => {
  it('names the query when there is one', () => {
    expect(toNoRoleMatchLine('  Kasse ', ALL_ROLES_FILTER_ID)).toContain('Kasse');
  });

  it('explains the status when only a chip narrows the list', () => {
    expect(toNoRoleMatchLine('', ARCHIVED_ROLES_FILTER_ID)).toBe(
      'Gerade ist keine Rolle archiviert. Wähle „Alle“, um wieder alle zu sehen.',
    );
  });

  it('falls back to the cold case under Alle', () => {
    expect(toNoRoleMatchLine('', ALL_ROLES_FILTER_ID)).toBe('Es gibt noch keine Rolle.');
  });
});

describe('toHolderUnitLabel', () => {
  it.each([
    { count: 0, expected: 'Inhaberschaften' },
    { count: 1, expected: 'Inhaberschaft' },
    { count: 4, expected: 'Inhaberschaften' },
  ])('names the unit for $count', ({ count, expected }) => {
    expect(toHolderUnitLabel(count)).toBe(expected);
  });
});

describe('toPermissionEntries', () => {
  it('follows the catalogue order and drops unknown keys', () => {
    const entries = toPermissionEntries(
      [PERMISSION_KEYS.groupsManage, 'events.manage', PERMISSION_KEYS.personsManage],
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

  it('de-duplicates the keys it keeps', () => {
    expect(
      toNextPermissionKeys(
        [PERMISSION_KEYS.groupsManage, PERMISSION_KEYS.groupsManage],
        PERMISSION_KEYS.rolesManage,
        false,
      ),
    ).toEqual([PERMISSION_KEYS.groupsManage]);
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

describe('count labels', () => {
  it.each([
    [0, 'unbesetzt'],
    [1, '1 Inhaberschaft'],
    [4, '4 Inhaberschaften'],
  ])('renders %i holdings', (count, expected) => {
    expect(toHolderCountLabel(count)).toBe(expected);
  });
});

describe('isSelfLockout', () => {
  it.each([
    {
      case: 'taking a held key off a Rolle the viewer holds',
      input: { enabled: false, viewerIsHolder: true, viewerHasKey: true },
      expected: true,
    },
    {
      case: 'switching a key on',
      input: { enabled: true, viewerIsHolder: true, viewerHasKey: true },
      expected: false,
    },
    {
      case: 'taking a key off a Rolle the viewer does not hold',
      input: { enabled: false, viewerIsHolder: false, viewerHasKey: true },
      expected: false,
    },
    {
      case: 'taking off a key the viewer never had',
      input: { enabled: false, viewerIsHolder: true, viewerHasKey: false },
      expected: false,
    },
  ])('is $expected when $case', ({ input, expected }) => {
    expect(isSelfLockout(input)).toBe(expected);
  });
});

describe('isKeyHandover', () => {
  it.each([
    {
      case: 'switching the rights key on',
      input: { key: PERMISSION_KEYS.rolesManage, enabled: true },
      expected: true,
    },
    {
      case: 'switching the rights key off',
      input: { key: PERMISSION_KEYS.rolesManage, enabled: false },
      expected: false,
    },
    {
      case: 'switching another key on',
      input: { key: PERMISSION_KEYS.groupsManage, enabled: true },
      expected: false,
    },
  ])('is $expected when $case', ({ input, expected }) => {
    expect(isKeyHandover(input)).toBe(expected);
  });
});

describe('toArchivedMeta', () => {
  it('renders the archive date as a day', () => {
    expect(toArchivedMeta('2026-09-12')).toBe('Archiviert am 12.09.2026');
  });

  it('says nothing for a live role', () => {
    expect(toArchivedMeta(null)).toBeUndefined();
  });
});

describe('dated write messages', () => {
  it('announces a future holding by its first day', () => {
    expect(toHolderAddedMessage('Heike Krämer', 'Präsidentin', '2026-11-11', '2026-09-12')).toBe(
      'Heike Krämer hat Präsidentin ab dem 11.11.2026 inne.',
    );
  });

  it('announces a holding that already runs without a date', () => {
    expect(toHolderAddedMessage('Heike Krämer', 'Präsidentin', '2026-09-12', '2026-09-12')).toBe(
      'Heike Krämer hat Präsidentin inne.',
    );
  });

  it('announces a future end in the future tense', () => {
    expect(toHoldingEndedMessage('Heike Krämer', '2026-11-10', '2026-09-12')).toBe(
      'Die Inhaberschaft von Heike Krämer endet am 10.11.2026.',
    );
  });

  it('announces an end that has arrived in the past tense', () => {
    expect(toHoldingEndedMessage('Heike Krämer', '2026-09-12', '2026-09-12')).toBe(
      'Die Inhaberschaft von Heike Krämer ist beendet.',
    );
  });

  it('states the last day in the future tense when the end is scheduled', () => {
    expect(toEndHoldingConsequence('Heike', 'Präsidentin', '2026-11-10', '2026-09-12')).toContain(
      'wird der letzte Tag',
    );
  });

  it('states the last day in the present tense when the end is today', () => {
    expect(toEndHoldingConsequence('Heike', 'Präsidentin', '2026-09-12', '2026-09-12')).toContain(
      'ist der letzte Tag',
    );
  });
});

describe('quick choices', () => {
  it('offers today and the opening of the running session', () => {
    expect(toStartQuickChoices(new Date(2026, 8, 12))).toEqual([
      { label: 'Heute', value: '2026-09-12' },
      { label: 'Sessionbeginn', value: '2025-11-11' },
    ]);
  });

  it('offers today only when today is the opening day', () => {
    expect(toStartQuickChoices(new Date(2026, 10, 11))).toEqual([
      { label: 'Heute', value: '2026-11-11' },
    ]);
  });

  it('offers today and the last day of the running session', () => {
    expect(toEndQuickChoices(new Date(2026, 8, 12))).toEqual([
      { label: 'Heute', value: '2026-09-12' },
      { label: 'Sessionende', value: '2026-11-10' },
    ]);
  });

  it('offers today only when today is the closing day', () => {
    expect(toEndQuickChoices(new Date(2026, 10, 10))).toEqual([
      { label: 'Heute', value: '2026-11-10' },
    ]);
  });
});
