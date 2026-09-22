import { describe, expect, it } from 'vitest';
import {
  findManagedGroup,
  isGroupKindArchivable,
  toArchiveConsequence,
  toGroupAdminsLine,
  toGroupFactsLine,
  toGroupKindEntries,
  toGroupKindLockedReason,
  toGroupKindsIntro,
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
  it('names every gap of a running group before its Gruppenart', () => {
    const flags = toGroupRegisterFlags(group({ admins: [], memberCount: 0 }));

    expect(flags.map((flag) => flag.id)).toEqual(['no-admin', 'no-kind', 'no-people']);
  });

  it('carries the Gruppenart alone once nothing is missing', () => {
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
    expect(toGroupKindsIntro(toGroupKindEntries([kind({ groupCount: 2 })]))).toBe(
      'Eine Art steht zur Auswahl.',
    );
  });

  it('counts the unused and the archived ones separately', () => {
    const entries = toGroupKindEntries([
      kind({ groupKindId: 1, groupCount: 2 }),
      kind({ groupKindId: 2, name: 'Elferrat', groupCount: 0 }),
      kind({ groupKindId: 3, name: 'Spielmannszug', archivedOn: '2026-01-01' }),
    ]);

    expect(toGroupKindsIntro(entries)).toBe(
      '2 Arten stehen zur Auswahl. Eine davon ohne Gruppe. Eine weitere ist archiviert.',
    );
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
    [1, 'Eine Gruppe trägt diese Art. Erst umtragen, dann archivieren.'],
    [3, '3 Gruppen tragen diese Art. Erst umtragen, dann archivieren.'],
  ])('explains %i as %s', (groupCount, expected) => {
    expect(toGroupKindLockedReason(groupCount)).toBe(expected);
  });
});
