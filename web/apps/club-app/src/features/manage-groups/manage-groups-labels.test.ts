import { describe, expect, it } from 'vitest';
import { ARCHIVED_CHIP } from '@/lib/state-chips';
import {
  findManagedGroup,
  isGroupKindArchivable,
  toArchiveConsequence,
  toArchivedGroupKindMeta,
  toGroupAdminsLine,
  toGroupKindEntries,
  toGroupKindsIntro,
  toGroupKindUsageLine,
  toManagedGroupStatusChip,
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

const GARDE = group({ groupId: 1, name: 'Große Garde' });
const MUSIKZUG = group({ groupId: 8, name: 'Musikzug', isRecruiting: false });
const CHRONIK = group({ groupId: 10, name: 'Archiv und Chronik', admins: [] });
const WIRBELWIND = group({
  groupId: 13,
  name: 'Tanzgruppe Wirbelwind',
  archivedOn: '2026-09-12',
  admins: [],
});
const ALL = [GARDE, MUSIKZUG, CHRONIK, WIRBELWIND];

describe('toManagedGroupStatusChip', () => {
  it('reports the archived state before anything else', () => {
    expect(toManagedGroupStatusChip(WIRBELWIND)).toBe(ARCHIVED_CHIP);
  });

  it('flags a group that is looking for people', () => {
    expect(toManagedGroupStatusChip(GARDE)?.tone).toBe('gold');
  });

  it('says nothing about a settled group', () => {
    expect(toManagedGroupStatusChip(MUSIKZUG)).toBeNull();
  });
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

describe('toArchiveConsequence', () => {
  it('agrees with a single Zugehörigkeit', () => {
    expect(toArchiveConsequence('Musikzug', 1, '12.09.2026')).toContain(
      'Die eine Zugehörigkeit bleibt bestehen.',
    );
  });

  it('agrees with several Zugehörigkeiten', () => {
    expect(toArchiveConsequence('Musikzug', 17, '12.09.2026')).toContain(
      'Die 17 Zugehörigkeiten bleiben bestehen.',
    );
  });

  it('says nobody is entered instead of counting zero', () => {
    expect(toArchiveConsequence('Musikzug', 0, '12.09.2026')).toContain(
      'Es ist gerade niemand eingetragen.',
    );
  });

  it('states the stamped day rather than offering one', () => {
    expect(toArchiveConsequence('Musikzug', 3, '12.09.2026')).toContain('Ab dem 12.09.2026');
  });
});

describe('toRestoreConsequence', () => {
  it('agrees with a single Zugehörigkeit', () => {
    expect(toRestoreConsequence('Musikzug', 1, '12.09.2026')).toContain(
      'Die eine Zugehörigkeit zählt wieder mit.',
    );
  });

  it('agrees with several Zugehörigkeiten', () => {
    expect(toRestoreConsequence('Musikzug', 6, '12.09.2026')).toContain(
      'Die 6 Zugehörigkeiten zählen wieder mit.',
    );
  });
});

describe('findManagedGroup', () => {
  it('finds nothing when no group is selected', () => {
    expect(findManagedGroup(ALL, null)).toBeNull();
  });

  it('finds nothing for an unknown id', () => {
    expect(findManagedGroup(ALL, 999)).toBeNull();
  });

  it('finds the selected group', () => {
    expect(findManagedGroup(ALL, 8)?.name).toBe('Musikzug');
  });
});

const kind = (overrides: Partial<ManagedGroupKind>): ManagedGroupKind => ({
  groupKindId: 1,
  name: 'Garde',
  sortOrder: 1,
  archivedOn: null,
  groupCount: 2,
  ...overrides,
});

describe('toGroupKindEntries', () => {
  it('puts the archived ones last, then sorts by place, then as German', () => {
    const entries = toGroupKindEntries([
      kind({ groupKindId: 4, name: 'Zugabteilung', sortOrder: 2 }),
      kind({ groupKindId: 3, name: 'Elferrat', sortOrder: 1, archivedOn: '2026-01-01' }),
      kind({ groupKindId: 2, name: 'Ältestenrat', sortOrder: 2 }),
      kind({ groupKindId: 1, name: 'Garde', sortOrder: 1 }),
    ]);

    expect(entries.map((entry) => entry.groupKindId)).toEqual([1, 2, 4, 3]);
  });

  it('marks an archived Gruppenart', () => {
    const entries = toGroupKindEntries([kind({ archivedOn: '2026-01-01' })]);

    expect(entries[0]?.isArchived).toBe(true);
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

describe('toGroupKindsIntro', () => {
  it('has its own line for an empty band', () => {
    expect(toGroupKindsIntro([])).toBe('Noch ist keine Gruppenart festgehalten.');
  });

  it('uses the singular for a single running Gruppenart', () => {
    expect(toGroupKindsIntro(toGroupKindEntries([kind({})]))).toBe(
      'Eine Gruppenart ist festgehalten.',
    );
  });

  it('counts the archived ones separately', () => {
    const entries = toGroupKindEntries([
      kind({ groupKindId: 1 }),
      kind({ groupKindId: 2, name: 'Elferrat' }),
      kind({ groupKindId: 3, name: 'Spielmannszug', archivedOn: '2026-01-01' }),
    ]);

    expect(toGroupKindsIntro(entries)).toBe(
      '2 Gruppenarten sind festgehalten. Eine weitere ist archiviert.',
    );
  });
});

describe('toArchivedGroupKindMeta', () => {
  it.each([
    [null, undefined],
    ['2026-09-12', 'Archiviert am 12.09.2026'],
  ])('writes %s as %s', (archivedOn, expected) => {
    expect(toArchivedGroupKindMeta(archivedOn)).toBe(expected);
  });
});
