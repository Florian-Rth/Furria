import { describe, expect, it } from 'vitest';
import type { ManageTileModel } from './manage-hub-labels';
import { isBoardEmpty, toManageBanks, toManageTiles } from './manage-hub-labels';
import type { ManageHub } from './schemas';

const EMPTY_HUB: ManageHub = {
  persons: null,
  groups: null,
  roles: null,
  board: null,
  sessions: null,
  venues: null,
  keys: null,
};

const hubWith = (panels: Partial<ManageHub>): ManageHub => ({ ...EMPTY_HUB, ...panels });

const SESSION_LABEL = '2025/26';

const onlyTile = (hub: ManageHub): ManageTileModel => {
  const [tile] = toManageTiles(hub, SESSION_LABEL);

  if (tile === undefined) {
    throw new Error('the fixture holds no panel');
  }

  return tile;
};

const footOf = (hub: ManageHub): string => onlyTile(hub).footLine;

describe('toManageTiles', () => {
  it.each([
    { personCount: 184, memberCount: 121, expected: '121 Mitglieder' },
    { personCount: 4, memberCount: 1, expected: '1 Mitglied' },
    { personCount: 4, memberCount: 0, expected: 'Keine Mitgliedschaft' },
    { personCount: 0, memberCount: 0, expected: 'Die erste Person' },
  ])('foots the Personen tile with "$expected"', ({ personCount, memberCount, expected }) => {
    expect(footOf(hubWith({ persons: { personCount, memberCount } }))).toBe(expected);
  });

  it.each([
    { groupCount: 9, archivedCount: 3, expected: '3 archiviert' },
    { groupCount: 9, archivedCount: 1, expected: '1 archiviert' },
    { groupCount: 9, archivedCount: 0, expected: 'Keine archiviert' },
    { groupCount: 0, archivedCount: 0, expected: 'Die erste Gruppe' },
  ])('foots the Gruppen tile with "$expected"', ({ groupCount, archivedCount, expected }) => {
    expect(footOf(hubWith({ groups: { groupCount, archivedCount } }))).toBe(expected);
  });

  it.each([
    { venueCount: 5, archivedCount: 2, expected: '2 archiviert' },
    { venueCount: 5, archivedCount: 1, expected: '1 archiviert' },
    { venueCount: 5, archivedCount: 0, expected: 'Keine archiviert' },
    { venueCount: 0, archivedCount: 0, expected: 'Der erste Ort' },
  ])('foots the Orte tile with "$expected"', ({ venueCount, archivedCount, expected }) => {
    expect(footOf(hubWith({ venues: { venueCount, archivedCount } }))).toBe(expected);
  });

  it.each([
    { issuedCount: 9, holdingCount: 7, holderCount: 4, expected: 'bei 4 Personen' },
    { issuedCount: 3, holdingCount: 2, holderCount: 1, expected: 'bei 1 Person' },
    { issuedCount: 3, holdingCount: 0, holderCount: 0, expected: 'Alle zurück' },
    { issuedCount: 0, holdingCount: 0, holderCount: 0, expected: 'Der erste Schlüssel' },
  ])('foots the Schlüssel tile with "$expected"', (fixture) => {
    const { issuedCount, holdingCount, holderCount, expected } = fixture;

    expect(footOf(hubWith({ keys: { issuedCount, holdingCount, holderCount } }))).toBe(expected);
  });

  it('counts a Schlüssel tile that was handed out and returned as a figure, not a dash', () => {
    const tile = onlyTile(hubWith({ keys: { issuedCount: 3, holdingCount: 0, holderCount: 0 } }));

    expect({ countLabel: tile.countLabel, isEmpty: tile.isEmpty }).toEqual({
      countLabel: '0',
      isEmpty: false,
    });
  });

  it.each([
    { entryCount: 3, hasCurrentEntry: true, expected: '2025/26 eingetragen' },
    { entryCount: 3, hasCurrentEntry: false, expected: '2025/26 fehlt noch' },
    { entryCount: 0, hasCurrentEntry: false, expected: 'Der erste Eintrag' },
  ])('foots the Sessionseinträge tile with "$expected"', (fixture) => {
    const { entryCount, hasCurrentEntry, expected } = fixture;

    expect(footOf(hubWith({ sessions: { entryCount, hasCurrentEntry } }))).toBe(expected);
  });

  it.each([
    { roleCount: 12, vacantCount: 2, vacancyLabel: '2 unbesetzt', footLine: 'Alle besetzt' },
    { roleCount: 12, vacantCount: 0, vacancyLabel: null, footLine: 'Alle besetzt' },
    { roleCount: 0, vacantCount: 0, vacancyLabel: null, footLine: 'Die erste Rolle' },
  ])('marks the Rollen tile with $vacancyLabel', (fixture) => {
    const { roleCount, vacantCount, vacancyLabel, footLine } = fixture;
    const tile = onlyTile(hubWith({ roles: { roleCount, vacantCount } }));

    expect({ vacancyLabel: tile.vacancyLabel, footLine: tile.footLine }).toEqual({
      vacancyLabel,
      footLine,
    });
  });

  it.each([
    {
      officeCount: 8,
      seatCount: 7,
      vacantOfficeCount: 1,
      vacancyLabel: '1 unbesetzt',
      footLine: '7 Sitze besetzt',
    },
    {
      officeCount: 7,
      seatCount: 7,
      vacantOfficeCount: 0,
      vacancyLabel: null,
      footLine: '7 Sitze besetzt',
    },
    {
      officeCount: 7,
      seatCount: 0,
      vacantOfficeCount: 7,
      vacancyLabel: '7 unbesetzt',
      footLine: 'Kein Sitz besetzt',
    },
    {
      officeCount: 1,
      seatCount: 1,
      vacantOfficeCount: 0,
      vacancyLabel: null,
      footLine: '1 Sitz besetzt',
    },
    {
      officeCount: 0,
      seatCount: 0,
      vacantOfficeCount: 0,
      vacancyLabel: null,
      footLine: 'Die erste Funktion',
    },
  ])('marks the Vorstand tile with $vacancyLabel', (fixture) => {
    const { officeCount, seatCount, vacantOfficeCount, vacancyLabel, footLine } = fixture;
    const tile = onlyTile(hubWith({ board: { officeCount, seatCount, vacantOfficeCount } }));

    expect({ vacancyLabel: tile.vacancyLabel, footLine: tile.footLine }).toEqual({
      vacancyLabel,
      footLine,
    });
  });

  it('counts the Vorstand tile by its Funktionen, not by the Sitze that fill them', () => {
    const tile = onlyTile(
      hubWith({ board: { officeCount: 7, seatCount: 0, vacantOfficeCount: 7 } }),
    );

    expect({ countLabel: tile.countLabel, isEmpty: tile.isEmpty }).toEqual({
      countLabel: '7',
      isEmpty: false,
    });
  });

  it('keeps no vacancy marking on a panel that has nothing yet', () => {
    const tile = onlyTile(hubWith({ roles: { roleCount: 0, vacantCount: 0 } }));

    expect({
      countLabel: tile.countLabel,
      isEmpty: tile.isEmpty,
      vacancyLabel: tile.vacancyLabel,
    }).toEqual({ countLabel: '—', isEmpty: true, vacancyLabel: null });
  });

  it('counts a filled panel with its own figure', () => {
    const tile = onlyTile(hubWith({ persons: { personCount: 184, memberCount: 121 } }));

    expect({ countLabel: tile.countLabel, isEmpty: tile.isEmpty }).toEqual({
      countLabel: '184',
      isEmpty: false,
    });
  });

  it('builds no tile for a panel the viewer may not see', () => {
    expect(toManageTiles(EMPTY_HUB, SESSION_LABEL)).toEqual([]);
  });

  it('keeps the declared panel order when only some panels arrive', () => {
    const hub = hubWith({
      keys: { issuedCount: 2, holdingCount: 2, holderCount: 2 },
      persons: { personCount: 5, memberCount: 5 },
      roles: { roleCount: 3, vacantCount: 0 },
    });

    expect(toManageTiles(hub, SESSION_LABEL).map((tile) => tile.id)).toEqual([
      'persons',
      'roles',
      'keys',
    ]);
  });
});

describe('toManageBanks', () => {
  const tilesOf = (hub: ManageHub): ReturnType<typeof toManageTiles> =>
    toManageTiles(hub, SESSION_LABEL);

  it('widens only the last tile of an odd bank', () => {
    const hub = hubWith({
      sessions: { entryCount: 1, hasCurrentEntry: true },
      venues: { venueCount: 2, archivedCount: 0 },
      keys: { issuedCount: 3, holdingCount: 3, holderCount: 2 },
    });
    const banks = toManageBanks(tilesOf(hub));

    expect(banks.map((bank) => bank.tiles.map((entry) => entry.isWide))).toEqual([
      [false, false, true],
    ]);
  });

  it('widens nothing in an even bank', () => {
    const hub = hubWith({
      persons: { personCount: 5, memberCount: 5 },
      groups: { groupCount: 2, archivedCount: 0 },
    });
    const banks = toManageBanks(tilesOf(hub));

    expect(banks.map((bank) => bank.tiles.map((entry) => entry.isWide))).toEqual([[false, false]]);
  });

  it('widens a lone tile', () => {
    const hub = hubWith({ keys: { issuedCount: 0, holdingCount: 0, holderCount: 0 } });
    const banks = toManageBanks(tilesOf(hub));

    expect(
      banks.map((bank) => ({ id: bank.id, wide: bank.tiles.map((entry) => entry.isWide) })),
    ).toEqual([{ id: 'record', wide: [true] }]);
  });

  it('leaves out a bank that has no tile at all', () => {
    const hub = hubWith({
      persons: { personCount: 5, memberCount: 5 },
      keys: { issuedCount: 1, holdingCount: 1, holderCount: 1 },
    });

    expect(toManageBanks(tilesOf(hub)).map((bank) => bank.id)).toEqual(['belonging', 'record']);
  });
});

describe('isBoardEmpty', () => {
  const tilesOf = (hub: ManageHub): ReturnType<typeof toManageTiles> =>
    toManageTiles(hub, SESSION_LABEL);

  it('reads an all-zero board as empty', () => {
    const hub = hubWith({
      persons: { personCount: 0, memberCount: 0 },
      groups: { groupCount: 0, archivedCount: 0 },
      keys: { issuedCount: 0, holdingCount: 0, holderCount: 0 },
    });

    expect(isBoardEmpty(tilesOf(hub))).toBe(true);
  });

  it('reads a board with one filled tile as not empty', () => {
    const hub = hubWith({
      persons: { personCount: 0, memberCount: 0 },
      groups: { groupCount: 1, archivedCount: 0 },
    });

    expect(isBoardEmpty(tilesOf(hub))).toBe(false);
  });

  it('reads a board with no tile at all as not empty', () => {
    expect(isBoardEmpty([])).toBe(false);
  });
});
