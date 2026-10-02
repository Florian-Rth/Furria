import { describe, expect, it } from 'vitest';
import { toRoleSheet } from './role-sheet';
import type { StartMine } from './schemas';

const mine = (overrides: Partial<StartMine>): StartMine => ({
  kind: 'newRole',
  subjectId: 7,
  on: '2027-01-18',
  until: '2027-01-31',
  name: 'Kassenwart',
  groupTone: null,
  function: null,
  changedBy: null,
  sessionStartYear: null,
  years: null,
  permissionKeys: null,
  ...overrides,
});

describe('toRoleSheet', () => {
  it.each<{ label: string; keys: string[] | null; permissions: number; manages: boolean }>([
    { label: 'grants nothing', keys: null, permissions: 0, manages: false },
    { label: 'only reads the club', keys: ['club.read'], permissions: 1, manages: false },
    {
      label: 'manages persons',
      keys: ['club.read', 'persons.manage'],
      permissions: 2,
      manages: true,
    },
    {
      label: 'carries a key the app does not know',
      keys: ['club.read', 'drinks.manage'],
      permissions: 1,
      manages: false,
    },
  ])('explains a role that $label', ({ keys, permissions, manages }) => {
    const sheet = toRoleSheet(mine({ permissionKeys: keys }));

    expect(sheet.permissions).toHaveLength(permissions);
    expect(sheet.manages).toBe(manages);
  });

  it('titles a board seat by its office', () => {
    const role = toRoleSheet(mine({ kind: 'newRole', name: 'Kassenwart' }));
    const office = toRoleSheet(mine({ kind: 'newBoardSeat', name: 'Kassenwart' }));

    expect(office.title).not.toBe(role.title);
    expect(office.title).toContain('Kassenwart');
  });
});
