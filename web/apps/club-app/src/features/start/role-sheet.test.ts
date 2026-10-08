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
  it.each<{
    label: string;
    keys: string[] | null;
    permissions: number;
    workbench: string | null;
  }>([
    { label: 'grants nothing', keys: null, permissions: 0, workbench: null },
    { label: 'only reads the club', keys: ['club.read'], permissions: 1, workbench: null },
    {
      label: 'manages persons',
      keys: ['club.read', 'persons.manage'],
      permissions: 2,
      workbench: '/manage',
    },
    {
      label: 'only handles ticket requests',
      keys: ['ticket_requests.handle'],
      permissions: 1,
      workbench: '/events',
    },
    {
      label: 'manages persons and events',
      keys: ['events.manage', 'persons.manage'],
      permissions: 2,
      workbench: '/manage',
    },
    {
      label: 'carries a key the app does not know',
      keys: ['club.read', 'drinks.manage'],
      permissions: 1,
      workbench: null,
    },
  ])('explains a role that $label', ({ keys, permissions, workbench }) => {
    const sheet = toRoleSheet(mine({ permissionKeys: keys }));

    expect(sheet.permissions).toHaveLength(permissions);
    expect(sheet.workbench?.to ?? null).toBe(workbench);
  });
});
