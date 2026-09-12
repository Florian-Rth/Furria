import { describe, expect, it } from 'vitest';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import {
  toArchivedMeta,
  toEndHoldingConsequence,
  toEndQuickChoices,
  toHolderAddedMessage,
  toHolderCountLabel,
  toHoldersMeta,
  toHoldingEndedMessage,
  toMasterEntries,
  toNextPermissionKeys,
  toPermissionEntries,
  toRoleSearchTerm,
  toRoleSeed,
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
  it('reports an unheld role', () => {
    expect(toHoldersMeta([])).toBe('unbesetzt');
  });

  it('names the single holder', () => {
    expect(toHoldersMeta([{ firstName: 'Heike', lastName: 'Krämer' }])).toBe('Heike Krämer');
  });

  it('names the second holder as one further Person, not as a bare number', () => {
    expect(
      toHoldersMeta([
        { firstName: 'Jörg', lastName: 'Krüger' },
        { firstName: 'Heike', lastName: 'Krämer' },
      ]),
    ).toBe('Jörg Krüger und 1 weitere Person');
  });

  it('counts the remaining holders after the first', () => {
    expect(
      toHoldersMeta([
        { firstName: 'Heike', lastName: 'Krämer' },
        { firstName: 'Jörg', lastName: 'Krüger' },
        { firstName: 'Lukas', lastName: 'Schmitt' },
      ]),
    ).toBe('Heike Krämer und 2 weitere');
  });
});

describe('toMasterEntries', () => {
  const roles: readonly RoleSummary[] = [
    role({ roleId: 1, name: 'Admin' }),
    role({ roleId: 9, name: 'Pressewartin', archivedOn: '2026-09-12' }),
    role({ roleId: 3, name: 'Finanzen', description: 'Führt die Kasse und die Beiträge.' }),
  ];

  it('keeps the server order but moves archived roles last', () => {
    expect(toMasterEntries(roles, '').map((entry) => entry.roleId)).toEqual([1, 3, 9]);
  });

  it('marks the archived row', () => {
    const archived = toMasterEntries(roles, '').find((entry) => entry.roleId === 9);

    expect(archived?.isArchived).toBe(true);
  });

  it('folds umlauts when matching the name', () => {
    expect(toMasterEntries(roles, 'pressewartin').map((entry) => entry.roleId)).toEqual([9]);
  });

  it('matches the description as well as the name', () => {
    expect(toMasterEntries(roles, 'kasse').map((entry) => entry.roleId)).toEqual([3]);
  });

  it('requires every word of the query to match', () => {
    expect(toMasterEntries(roles, 'kasse beitraege')).toEqual([]);
    expect(toMasterEntries(roles, 'kasse beitrage').map((entry) => entry.roleId)).toEqual([3]);
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
