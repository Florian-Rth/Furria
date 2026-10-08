import { describe, expect, it } from 'vitest';
import type { ManageRowModel } from './manage-hub-labels';
import { isBoardEmpty, toManageBanks, toManageRows } from './manage-hub-labels';
import type { ManageHub } from './schemas';

const EMPTY_HUB: ManageHub = {
  persons: null,
  groups: null,
  roles: null,
  board: null,
  clubRecord: null,
  sessions: null,
  venues: null,
  keys: null,
  accounts: null,
  applications: null,
  toDos: [],
};

const hubWith = (panels: Partial<ManageHub>): ManageHub => ({ ...EMPTY_HUB, ...panels });

const SESSION_LABEL = '2025/26';

const onlyRow = (hub: ManageHub): ManageRowModel => {
  const [row] = toManageRows(hub, SESSION_LABEL);

  if (row === undefined) {
    throw new Error('the fixture holds no panel');
  }

  return row;
};

describe('toManageRows', () => {
  it.each([
    { hub: hubWith({ clubRecord: { name: 'GCC e.V.', missingFactCount: 0 } }), hasSummary: true },
    { hub: hubWith({ clubRecord: { name: null, missingFactCount: 0 } }), hasSummary: false },
    { hub: hubWith({ applications: { undecidedCount: 0, minorCount: 0 } }), hasSummary: true },
    { hub: hubWith({ applications: { undecidedCount: 3, minorCount: 1 } }), hasSummary: true },
    { hub: hubWith({ applications: { undecidedCount: 2, minorCount: 0 } }), hasSummary: false },
  ])(
    'carries a summary ($hasSummary) only when the row has something to sum up',
    ({ hub, hasSummary }) => {
      expect(onlyRow(hub).summary !== undefined).toBe(hasSummary);
    },
  );

  it.each([
    { hub: hubWith({ roles: { roleCount: 12, vacantCount: 2 } }) },
    { hub: hubWith({ board: { officeCount: 8, seatCount: 7, vacantOfficeCount: 1 } }) },
    { hub: hubWith({ sessions: { entryCount: 3, hasCurrentEntry: false } }) },
    { hub: hubWith({ clubRecord: { name: null, missingFactCount: 1 } }) },
    { hub: hubWith({ applications: { undecidedCount: 2, minorCount: 1 } }) },
  ])('flags a row that needs attention', ({ hub }) => {
    expect(onlyRow(hub).status?.tone).toBe('gold');
  });

  it.each([
    { hub: hubWith({ roles: { roleCount: 12, vacantCount: 0 } }) },
    { hub: hubWith({ board: { officeCount: 7, seatCount: 7, vacantOfficeCount: 0 } }) },
    { hub: hubWith({ sessions: { entryCount: 3, hasCurrentEntry: true } }) },
    { hub: hubWith({ clubRecord: { name: 'GCC e.V.', missingFactCount: 0 } }) },
    { hub: hubWith({ persons: { personCount: 184, memberCount: 121 } }) },
    { hub: hubWith({ keys: { issuedCount: 3, holdingCount: 3, holderCount: 2 } }) },
    { hub: hubWith({ applications: { undecidedCount: 0, minorCount: 0 } }) },
  ])('flags nothing on a settled row', ({ hub }) => {
    expect(onlyRow(hub).status).toBeUndefined();
  });

  it.each([
    { hub: hubWith({ persons: { personCount: 0, memberCount: 0 } }) },
    { hub: hubWith({ groups: { groupCount: 0, archivedCount: 0 } }) },
    { hub: hubWith({ roles: { roleCount: 0, vacantCount: 0 } }) },
    { hub: hubWith({ board: { officeCount: 0, seatCount: 0, vacantOfficeCount: 0 } }) },
    { hub: hubWith({ sessions: { entryCount: 0, hasCurrentEntry: false } }) },
    { hub: hubWith({ venues: { venueCount: 0, archivedCount: 0 } }) },
    { hub: hubWith({ keys: { issuedCount: 0, holdingCount: 0, holderCount: 0 } }) },
  ])('marks an empty register as empty, with no summary and a neutral status', ({ hub }) => {
    const row = onlyRow(hub);

    expect({ isEmpty: row.isEmpty, summary: row.summary, tone: row.status?.tone }).toEqual({
      isEmpty: true,
      summary: undefined,
      tone: 'neutral',
    });
  });

  it.each([
    { hub: hubWith({ groups: { groupCount: 0, archivedCount: 2 } }) },
    { hub: hubWith({ venues: { venueCount: 0, archivedCount: 1 } }) },
    { hub: hubWith({ keys: { issuedCount: 3, holdingCount: 0, holderCount: 0 } }) },
    { hub: hubWith({ applications: { undecidedCount: 0, minorCount: 0 } }) },
  ])('keeps a register with only history as filled', ({ hub }) => {
    expect(onlyRow(hub).isEmpty).toBe(false);
  });

  it('builds no row for a panel the viewer may not see', () => {
    expect(toManageRows(EMPTY_HUB, SESSION_LABEL)).toEqual([]);
  });

  it('keeps the declared panel order when only some panels arrive', () => {
    const hub = hubWith({
      keys: { issuedCount: 2, holdingCount: 2, holderCount: 2 },
      persons: { personCount: 5, memberCount: 5 },
      roles: { roleCount: 3, vacantCount: 0 },
    });

    expect(toManageRows(hub, SESSION_LABEL).map((row) => row.id)).toEqual([
      'persons',
      'roles',
      'keys',
    ]);
  });
});

describe('toManageBanks', () => {
  it('groups rows into their banks and leaves out a bank with no row', () => {
    const hub = hubWith({
      persons: { personCount: 5, memberCount: 5 },
      keys: { issuedCount: 1, holdingCount: 1, holderCount: 1 },
      venues: { venueCount: 2, archivedCount: 0 },
    });
    const banks = toManageBanks(toManageRows(hub, SESSION_LABEL));

    expect(banks.map((bank) => ({ id: bank.id, rows: bank.rows.map((row) => row.id) }))).toEqual([
      { id: 'belonging', rows: ['persons'] },
      { id: 'record', rows: ['venues', 'keys'] },
    ]);
  });
});

describe('isBoardEmpty', () => {
  const rowsOf = (hub: ManageHub): ManageRowModel[] => toManageRows(hub, SESSION_LABEL);

  it('reads an all-zero board as empty', () => {
    const hub = hubWith({
      persons: { personCount: 0, memberCount: 0 },
      groups: { groupCount: 0, archivedCount: 0 },
      keys: { issuedCount: 0, holdingCount: 0, holderCount: 0 },
    });

    expect(isBoardEmpty(rowsOf(hub))).toBe(true);
  });

  it('reads a board with one filled row as not empty', () => {
    const hub = hubWith({
      persons: { personCount: 0, memberCount: 0 },
      groups: { groupCount: 1, archivedCount: 0 },
    });

    expect(isBoardEmpty(rowsOf(hub))).toBe(false);
  });

  it('reads a board with no row at all as not empty', () => {
    expect(isBoardEmpty([])).toBe(false);
  });
});
