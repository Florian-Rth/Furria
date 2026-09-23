import { describe, expect, it } from 'vitest';
import {
  findGroupKindEntry,
  isGroupKindArchivable,
  toGroupAdminsLine,
  toGroupFactsLine,
  toGroupKindEntries,
  toGroupKindEntryId,
  toGroupKindLockedReason,
  toGroupKindUsageBadge,
  toGroupKindUsageLine,
  toGroupRegisterFlags,
  toRestoreConsequence,
} from './manage-groups-labels';
import type { ManagedGroupKind, ManagedGroupSummary } from './schemas';

const admin = (personId: number): ManagedGroupSummary['admins'][number] => ({
  personId,
  firstName: 'Birgit',
  lastName: 'Kühnel',
});

const group = (overrides: Partial<ManagedGroupSummary>): ManagedGroupSummary => ({
  groupId: 1,
  name: 'Große Garde',
  description: 'Tanzt.',
  isRecruiting: true,
  groupKindId: null,
  groupKindName: null,
  tone: null,
  archivedOn: null,
  memberCount: 18,
  admins: [admin(8)],
  ...overrides,
});

describe('toGroupAdminsLine', () => {
  it('reports nobody as an absent line', () => {
    expect(toGroupAdminsLine([])).toBeNull();
  });

  it('names a single admin', () => {
    expect(toGroupAdminsLine([admin(1)])).toBe('Birgit Kühnel');
  });

  it('counts one further admin in the singular', () => {
    expect(toGroupAdminsLine([admin(1), admin(2)])).toBe('Birgit Kühnel und 1 weitere Person');
  });

  it('counts several further admins in the plural', () => {
    expect(toGroupAdminsLine([admin(1), admin(2), admin(3)])).toBe(
      'Birgit Kühnel und 2 weitere Personen',
    );
  });
});

describe('toGroupFactsLine', () => {
  it('joins the admin line and the size line', () => {
    expect(toGroupFactsLine(group({ memberCount: 18 }))).toBe('Birgit Kühnel · 18 Personen');
  });

  it('drops an empty group from the line', () => {
    expect(toGroupFactsLine(group({ memberCount: 0 }))).toBe('Birgit Kühnel');
  });

  it('stays silent when neither an admin nor a person is there', () => {
    expect(toGroupFactsLine(group({ memberCount: 0, admins: [] }))).toBeNull();
  });
});

describe('toGroupRegisterFlags', () => {
  it('names every gap of a running group before its group kind', () => {
    const flags = toGroupRegisterFlags(group({ admins: [], memberCount: 0 }));

    expect(flags.map((flag) => flag.id)).toEqual(['no-admin', 'no-kind', 'no-people']);
  });

  it('carries the group kind alone once nothing is missing', () => {
    const flags = toGroupRegisterFlags(group({ groupKindId: 2, groupKindName: 'Garde' }));

    expect(flags).toEqual([{ id: 'kind', label: 'Garde', tone: 'neutral', dot: false }]);
  });

  it('replaces the gaps of an archived group with its archive day', () => {
    const flags = toGroupRegisterFlags(
      group({ archivedOn: '2026-09-12', admins: [], memberCount: 0 }),
    );

    expect(flags).toEqual([
      { id: 'archived', label: 'Archiviert am 12.09.2026', tone: 'neutral', dot: false },
    ]);
  });
});

describe('toRestoreConsequence', () => {
  it('agrees with a single group membership', () => {
    expect(toRestoreConsequence('Musikzug', 1, '12.09.2026')).toContain(
      '1 Zugehörigkeit zählt wieder mit.',
    );
  });

  it('agrees with several group memberships', () => {
    expect(toRestoreConsequence('Musikzug', 6, '12.09.2026')).toContain(
      '6 Zugehörigkeiten zählen wieder mit.',
    );
  });
});

const kind = (overrides: Partial<ManagedGroupKind>): ManagedGroupKind => ({
  groupKindId: 1,
  name: 'Garde',
  archivedOn: null,
  groupCount: 2,
  ...overrides,
});

describe('toGroupKindEntries', () => {
  it('puts the archived ones last and sorts the rest as German', () => {
    const entries = toGroupKindEntries([
      kind({ groupKindId: 4, name: 'Zugabteilung' }),
      kind({ groupKindId: 3, name: 'Elferrat', archivedOn: '2026-01-01' }),
      kind({ groupKindId: 2, name: 'Ältestenrat' }),
      kind({ groupKindId: 1, name: 'Garde' }),
    ]);

    expect(entries.map((entry) => entry.groupKindId)).toEqual([2, 1, 4, 3]);
  });

  it('marks an archived group kind', () => {
    const entries = toGroupKindEntries([kind({ archivedOn: '2026-01-01' })]);

    expect(entries[0]?.isArchived).toBe(true);
  });
});

describe('findGroupKindEntry', () => {
  const entries = toGroupKindEntries([kind({ groupKindId: 1, name: 'Garde' })]);

  it('finds nothing when no group kind is selected', () => {
    expect(findGroupKindEntry(entries, null)).toBeNull();
  });

  it('finds nothing for an unknown id', () => {
    expect(findGroupKindEntry(entries, 999)).toBeNull();
  });

  it('finds the selected group kind', () => {
    expect(findGroupKindEntry(entries, 1)?.name).toBe('Garde');
  });
});

describe('toGroupKindEntryId', () => {
  it.each([
    { case: 'a positive id', raw: '3', expected: 3 },
    { case: 'a long id', raw: '1204', expected: 1204 },
    { case: 'zero', raw: '0', expected: null },
    { case: 'a negative id', raw: '-3', expected: null },
    { case: 'a word', raw: 'garde', expected: null },
    { case: 'a decimal', raw: '3.5', expected: null },
    { case: 'nothing', raw: '', expected: null },
  ])('reads $case', ({ raw, expected }) => {
    expect(toGroupKindEntryId(raw)).toBe(expected);
  });
});

describe('isGroupKindArchivable', () => {
  it.each([
    [{ archivedOn: null, groupCount: 0 }, true],
    [{ archivedOn: null, groupCount: 1 }, false],
    [{ archivedOn: '2026-01-01', groupCount: 0 }, false],
  ])('reads %o as %s', (overrides, expected) => {
    const entry = toGroupKindEntries([kind(overrides)])[0];

    expect(entry !== undefined && isGroupKindArchivable(entry)).toBe(expected);
  });
});

describe('toGroupKindUsageLine', () => {
  it.each([
    [0, 'keine Gruppe'],
    [1, '1 Gruppe'],
    [4, '4 Gruppen'],
  ])('writes %i as %s', (groupCount, expected) => {
    expect(toGroupKindUsageLine(groupCount)).toBe(expected);
  });
});

describe('toGroupKindUsageBadge', () => {
  it.each([
    [{ groupCount: 0 }, 'Ohne Gruppe', 'gold'],
    [{ groupCount: 2 }, '2 Gruppen', 'neutral'],
    [{ groupCount: 0, archivedOn: '2026-09-12' }, 'Archiviert am 12.09.2026', 'neutral'],
  ])('badges %o as %s', (overrides, label, tone) => {
    const entry = toGroupKindEntries([kind(overrides)])[0];

    expect(entry === undefined ? null : toGroupKindUsageBadge(entry)).toMatchObject({
      label,
      tone,
    });
  });
});

describe('toGroupKindLockedReason', () => {
  it.each([
    [1, 'Einer Gruppe ist diese Art zugeordnet. Ändere zuerst die Zuordnung.'],
    [3, '3 Gruppen ist diese Art zugeordnet. Ändere zuerst die Zuordnung.'],
  ])('explains %i as %s', (groupCount, expected) => {
    expect(toGroupKindLockedReason(groupCount)).toBe(expected);
  });
});
