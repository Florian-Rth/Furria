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

const summaryOf = (hub: ManageHub): string | undefined => onlyRow(hub).summary;

describe('toManageRows', () => {
  it.each([
    { personCount: 184, memberCount: 121, expected: '184 Personen · 121 Mitglieder' },
    { personCount: 1, memberCount: 1, expected: '1 Person · 1 Mitglied' },
    { personCount: 4, memberCount: 0, expected: '4 Personen · 0 Mitglieder' },
  ])('sums up the persons row as "$expected"', ({ personCount, memberCount, expected }) => {
    expect(summaryOf(hubWith({ persons: { personCount, memberCount } }))).toBe(expected);
  });

  it.each([
    { groupCount: 9, archivedCount: 3, expected: '9 Gruppen · 3 archiviert' },
    { groupCount: 1, archivedCount: 0, expected: '1 Gruppe' },
    { groupCount: 0, archivedCount: 2, expected: '0 Gruppen · 2 archiviert' },
  ])('sums up the groups row as "$expected"', ({ groupCount, archivedCount, expected }) => {
    expect(summaryOf(hubWith({ groups: { groupCount, archivedCount } }))).toBe(expected);
  });

  it.each([
    { venueCount: 5, archivedCount: 1, expected: '5 Orte · 1 archiviert' },
    { venueCount: 1, archivedCount: 0, expected: '1 Ort' },
  ])('sums up the venues row as "$expected"', ({ venueCount, archivedCount, expected }) => {
    expect(summaryOf(hubWith({ venues: { venueCount, archivedCount } }))).toBe(expected);
  });

  it.each([
    { issuedCount: 9, holdingCount: 7, holderCount: 4, expected: '7 ausgegeben · bei 4 Personen' },
    { issuedCount: 3, holdingCount: 1, holderCount: 1, expected: '1 ausgegeben · bei 1 Person' },
    { issuedCount: 3, holdingCount: 0, holderCount: 0, expected: 'Alle zurück' },
  ])('sums up the keys row as "$expected"', (fixture) => {
    const { issuedCount, holdingCount, holderCount, expected } = fixture;

    expect(summaryOf(hubWith({ keys: { issuedCount, holdingCount, holderCount } }))).toBe(expected);
  });

  it.each([
    { officeCount: 8, seatCount: 7, expected: '8 Funktionen · 7 Sitze besetzt' },
    { officeCount: 1, seatCount: 1, expected: '1 Funktion · 1 Sitz besetzt' },
    { officeCount: 7, seatCount: 0, expected: '7 Funktionen · 0 Sitze besetzt' },
  ])('sums up the board row as "$expected"', ({ officeCount, seatCount, expected }) => {
    const board = { officeCount, seatCount, vacantOfficeCount: 0 };

    expect(summaryOf(hubWith({ board }))).toBe(expected);
  });

  it.each([
    { name: 'GCC e.V.', expected: 'GCC e.V.' },
    { name: null, expected: undefined },
  ])('sums up the club record row named $name as $expected', ({ name, expected }) => {
    expect(summaryOf(hubWith({ clubRecord: { name, missingFactCount: 0 } }))).toBe(expected);
  });

  it.each([
    { entryCount: 3, expected: '3 Einträge' },
    { entryCount: 1, expected: '1 Eintrag' },
  ])('sums up the session records row as "$expected"', ({ entryCount, expected }) => {
    expect(summaryOf(hubWith({ sessions: { entryCount, hasCurrentEntry: true } }))).toBe(expected);
  });

  it.each([
    { hub: hubWith({ roles: { roleCount: 12, vacantCount: 2 } }), expected: '2 unbesetzt' },
    {
      hub: hubWith({ board: { officeCount: 8, seatCount: 7, vacantOfficeCount: 1 } }),
      expected: '1 unbesetzt',
    },
    {
      hub: hubWith({ sessions: { entryCount: 3, hasCurrentEntry: false } }),
      expected: '2025/26 fehlt',
    },
    {
      hub: hubWith({ clubRecord: { name: null, missingFactCount: 1 } }),
      expected: '1 Angabe fehlt',
    },
    {
      hub: hubWith({ clubRecord: { name: null, missingFactCount: 4 } }),
      expected: '4 Angaben fehlen',
    },
  ])('flags "$expected" as needing attention', ({ hub, expected }) => {
    expect(onlyRow(hub).status).toEqual({ label: expected, tone: 'gold' });
  });

  it.each([
    { hub: hubWith({ roles: { roleCount: 12, vacantCount: 0 } }) },
    { hub: hubWith({ board: { officeCount: 7, seatCount: 7, vacantOfficeCount: 0 } }) },
    { hub: hubWith({ sessions: { entryCount: 3, hasCurrentEntry: true } }) },
    { hub: hubWith({ clubRecord: { name: 'GCC e.V.', missingFactCount: 0 } }) },
    { hub: hubWith({ persons: { personCount: 184, memberCount: 121 } }) },
    { hub: hubWith({ keys: { issuedCount: 3, holdingCount: 3, holderCount: 2 } }) },
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
