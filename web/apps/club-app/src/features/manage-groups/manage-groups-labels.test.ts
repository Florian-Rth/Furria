import { describe, expect, it } from 'vitest';
import {
  ACTIVE_GROUPS_FILTER_ID,
  ALL_GROUPS_FILTER_ID,
  ARCHIVED_GROUPS_FILTER_ID,
  filterManagedGroups,
  findManagedGroup,
  toArchiveConsequence,
  toGroupCountLine,
  toGroupHistoryEntries,
  toGroupStatusFilterId,
  toGroupStatusFilterOptions,
  toManagedGroupChips,
  toManagedGroupRowChip,
  toManagedGroupsIntro,
  toRestoreConsequence,
} from './manage-groups-labels';
import type { ManagedAdmin, ManagedGroupSummary, ManagedMember } from './schemas';

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

const idsOf = (groups: readonly ManagedGroupSummary[]): number[] =>
  groups.map((found) => found.groupId);

describe('filterManagedGroups', () => {
  it('sorts archived groups last and the rest by German collation', () => {
    expect(idsOf(filterManagedGroups(ALL, '', ALL_GROUPS_FILTER_ID))).toEqual([10, 1, 8, 13]);
  });

  it('keeps only active groups for the active filter', () => {
    expect(idsOf(filterManagedGroups(ALL, '', ACTIVE_GROUPS_FILTER_ID))).toEqual([10, 1, 8]);
  });

  it('keeps only archived groups for the archived filter', () => {
    expect(idsOf(filterManagedGroups(ALL, '', ARCHIVED_GROUPS_FILTER_ID))).toEqual([13]);
  });

  it('folds umlauts and case when matching the name', () => {
    expect(idsOf(filterManagedGroups(ALL, 'grosse', ALL_GROUPS_FILTER_ID))).toEqual([1]);
  });

  it('combines the query with the status filter', () => {
    expect(idsOf(filterManagedGroups(ALL, 'tanz', ACTIVE_GROUPS_FILTER_ID))).toEqual([]);
  });
});

describe('toGroupStatusFilterOptions', () => {
  it('counts all, active and archived groups', () => {
    expect(toGroupStatusFilterOptions(ALL).map((option) => option.count)).toEqual([4, 3, 1]);
  });

  it('reports zero counts for an empty register', () => {
    expect(toGroupStatusFilterOptions([]).map((option) => option.count)).toEqual([0, 0, 0]);
  });
});

describe('toGroupStatusFilterId', () => {
  it.each([
    ['active', ACTIVE_GROUPS_FILTER_ID],
    ['archived', ARCHIVED_GROUPS_FILTER_ID],
    ['nonsense', ALL_GROUPS_FILTER_ID],
    ['', ALL_GROUPS_FILTER_ID],
  ])('maps %s onto %s', (raw, expected) => {
    expect(toGroupStatusFilterId(raw)).toBe(expected);
  });
});

describe('toManagedGroupChips', () => {
  it('reports the archived status before the missing admin', () => {
    expect(toManagedGroupChips(WIRBELWIND).status?.label).toBe('archiviert');
  });

  it('warns about a group without a running admin', () => {
    expect(toManagedGroupChips(CHRONIK).status?.tone).toBe('gold');
  });

  it('reports no status for an ordinary group', () => {
    expect(toManagedGroupChips(GARDE).status).toBeNull();
  });

  it('always reports the openness', () => {
    expect(toManagedGroupChips(MUSIKZUG).openness.dot).toBe(false);
  });
});

describe('toManagedGroupRowChip', () => {
  it('shows the archived status over everything else', () => {
    expect(toManagedGroupRowChip(WIRBELWIND).label).toBe('archiviert');
  });

  it('shows the missing admin warning over the openness', () => {
    expect(toManagedGroupRowChip(CHRONIK).tone).toBe('gold');
  });

  it('falls back to the openness when nothing is urgent', () => {
    expect(toManagedGroupRowChip(MUSIKZUG).label).toBe('sucht gerade niemanden');
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

describe('toManagedGroupsIntro', () => {
  it('counts the active groups and the archived ones separately', () => {
    expect(toManagedGroupsIntro(ALL)).toBe(
      '3 Gruppen stehen im Verzeichnis. Eine weitere ist archiviert.',
    );
  });

  it('drops the archived sentence when there are none', () => {
    expect(toManagedGroupsIntro([GARDE, MUSIKZUG])).toBe('2 Gruppen stehen im Verzeichnis.');
  });

  it('uses the singular for a single active group', () => {
    expect(toManagedGroupsIntro([GARDE])).toBe('Eine Gruppe steht im Verzeichnis.');
  });

  it('has its own line for an empty register', () => {
    expect(toManagedGroupsIntro([])).toBe('Noch steht keine Gruppe im Verzeichnis.');
  });
});

describe('toGroupCountLine', () => {
  it('drops the admin half when the group has no running admin', () => {
    expect(toGroupCountLine(CHRONIK)).toBe('18 Personen');
  });

  it('joins people and admins when both are there', () => {
    expect(toGroupCountLine(GARDE)).toBe('18 Personen · 1 Admin');
  });

  it('names the empty group instead of counting zero', () => {
    expect(toGroupCountLine(group({ memberCount: 0, admins: [] }))).toBe('niemand dabei');
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

const pastMember = (id: number, joinedOn: string, leftOn: string): ManagedMember => ({
  groupMembershipId: id,
  personId: id,
  firstName: 'Paula',
  lastName: 'Brendel',
  joinedOn,
  leftOn,
  since: joinedOn,
});

const pastAdmin = (id: number, sinceOn: string, untilOn: string): ManagedAdmin => ({
  groupAdminId: id,
  personId: id,
  firstName: 'Anna',
  lastName: 'Ärgerlich',
  function: null,
  sinceOn,
  untilOn,
  since: sinceOn,
});

describe('toGroupHistoryEntries', () => {
  it('mixes both kinds and orders them by the newest start', () => {
    const entries = toGroupHistoryEntries(
      [pastMember(1, '2012-01-01', '2016-02-10')],
      [pastAdmin(2, '2020-03-01', '2022-02-28')],
    );

    expect(entries.map((entry) => entry.key)).toEqual(['admin-2', 'membership-1']);
  });

  it('renders a closed row as a span, never as a since line', () => {
    const [entry] = toGroupHistoryEntries([pastMember(1, '2012-01-01', '2016-02-10')], []);

    expect(entry?.span).toBe('01.01.2012 – 10.02.2016');
  });

  it('breaks a tie on the same start date by key', () => {
    const entries = toGroupHistoryEntries(
      [pastMember(4, '2020-01-01', '2021-01-01')],
      [pastAdmin(3, '2020-01-01', '2021-01-01')],
    );

    expect(entries.map((entry) => entry.key)).toEqual(['admin-3', 'membership-4']);
  });
});
