import { describe, expect, it } from 'vitest';
import type { GroupRegisterBands, GroupWorkFilterId } from './manage-groups-work';
import {
  ALL_GROUPS_FILTER_ID,
  ARCHIVED_GROUPS_FILTER_ID,
  countBandedGroups,
  NO_ADMIN_GROUPS_FILTER_ID,
  NO_KIND_GROUPS_FILTER_ID,
  resolveGroupWorkFilter,
  toGroupRegisterBands,
  toGroupWorkFacets,
  toGroupWorkFilterId,
  toGroupWorkFilterOptions,
  toManagedGroupsLead,
  toRegisterMeta,
} from './manage-groups-work';
import type { ManagedGroupSummary } from './schemas';

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
  groupKindId: 2,
  groupKindName: 'Garde',
  tone: null,
  archivedOn: null,
  memberCount: 18,
  admins: [admin(8)],
  ...overrides,
});

const GARDE = group({ groupId: 1, name: 'Große Garde' });
const MUSIKZUG = group({
  groupId: 8,
  name: 'Musikzug',
  isRecruiting: false,
  groupKindId: null,
  groupKindName: null,
});
const CHRONIK = group({
  groupId: 10,
  name: 'Archiv und Chronik',
  admins: [],
  groupKindId: null,
  groupKindName: null,
});
const WIRBELWIND = group({
  groupId: 13,
  name: 'Tanzgruppe Wirbelwind',
  archivedOn: '2026-09-12',
  admins: [],
  groupKindId: null,
  groupKindName: null,
});
const ALL = [GARDE, MUSIKZUG, CHRONIK, WIRBELWIND];

const idsOf = (groups: readonly ManagedGroupSummary[]): number[] =>
  groups.map((found) => found.groupId);

describe('toGroupWorkFacets', () => {
  it('counts the open work without letting archived groups raise an alarm', () => {
    expect(toGroupWorkFacets(ALL)).toEqual({
      total: 4,
      listed: 3,
      withoutAdmin: 1,
      withoutKind: 2,
      archived: 1,
      isSettled: false,
    });
  });

  it('settles once nothing is missing', () => {
    expect(toGroupWorkFacets([GARDE]).isSettled).toBe(true);
  });

  it('settles an empty register', () => {
    expect(toGroupWorkFacets([])).toEqual({
      total: 0,
      listed: 0,
      withoutAdmin: 0,
      withoutKind: 0,
      archived: 0,
      isSettled: true,
    });
  });
});

describe('toGroupWorkFilterOptions', () => {
  it('leads with the work and leaves the whole register last, each facet with its own tone', () => {
    expect(
      toGroupWorkFilterOptions(toGroupWorkFacets(ALL)).map((option) => ({
        id: option.id,
        count: option.count,
        tone: option.tone,
        countFirst: option.countFirst,
      })),
    ).toEqual([
      { id: NO_ADMIN_GROUPS_FILTER_ID, count: 1, tone: 'accent', countFirst: true },
      { id: NO_KIND_GROUPS_FILTER_ID, count: 2, tone: 'gold', countFirst: true },
      { id: ARCHIVED_GROUPS_FILTER_ID, count: 1, tone: 'neutral', countFirst: true },
      { id: ALL_GROUPS_FILTER_ID, count: 4, tone: undefined, countFirst: undefined },
    ]);
  });

  it('drops every facet that is at zero', () => {
    expect(toGroupWorkFilterOptions(toGroupWorkFacets([GARDE])).map((option) => option.id)).toEqual(
      [ALL_GROUPS_FILTER_ID],
    );
  });
});

describe('toGroupWorkFilterId', () => {
  it.each([
    [NO_ADMIN_GROUPS_FILTER_ID, NO_ADMIN_GROUPS_FILTER_ID],
    [NO_KIND_GROUPS_FILTER_ID, NO_KIND_GROUPS_FILTER_ID],
    [ARCHIVED_GROUPS_FILTER_ID, ARCHIVED_GROUPS_FILTER_ID],
    ['active', ALL_GROUPS_FILTER_ID],
    ['', ALL_GROUPS_FILTER_ID],
  ])('maps %s onto %s', (raw, expected) => {
    expect(toGroupWorkFilterId(raw)).toBe(expected);
  });
});

describe('resolveGroupWorkFilter', () => {
  const fallbacks: [GroupWorkFilterId, GroupWorkFilterId][] = [
    [NO_ADMIN_GROUPS_FILTER_ID, ALL_GROUPS_FILTER_ID],
    [NO_KIND_GROUPS_FILTER_ID, ALL_GROUPS_FILTER_ID],
    [ARCHIVED_GROUPS_FILTER_ID, ALL_GROUPS_FILTER_ID],
    [ALL_GROUPS_FILTER_ID, ALL_GROUPS_FILTER_ID],
  ];

  it.each(fallbacks)('falls %s back to %s once the facet is empty', (requested, expected) => {
    expect(resolveGroupWorkFilter(requested, toGroupWorkFacets([GARDE]))).toBe(expected);
  });

  it('keeps a facet that still carries work', () => {
    expect(resolveGroupWorkFilter(NO_ADMIN_GROUPS_FILTER_ID, toGroupWorkFacets(ALL))).toBe(
      NO_ADMIN_GROUPS_FILTER_ID,
    );
  });
});

describe('toGroupRegisterBands', () => {
  it('sorts each band by German collation and keeps the archived ones apart', () => {
    const bands = toGroupRegisterBands(ALL, '', ALL_GROUPS_FILTER_ID);

    expect(idsOf(bands.running)).toEqual([10, 1, 8]);
    expect(idsOf(bands.archived)).toEqual([13]);
  });

  it('keeps only the groups nobody runs', () => {
    const bands = toGroupRegisterBands(ALL, '', NO_ADMIN_GROUPS_FILTER_ID);

    expect(idsOf(bands.running)).toEqual([10]);
    expect(bands.archived).toEqual([]);
  });

  it('keeps only the groups without a Gruppenart', () => {
    expect(idsOf(toGroupRegisterBands(ALL, '', NO_KIND_GROUPS_FILTER_ID).running)).toEqual([10, 8]);
  });

  it('keeps only the archived groups', () => {
    const bands = toGroupRegisterBands(ALL, '', ARCHIVED_GROUPS_FILTER_ID);

    expect(bands.running).toEqual([]);
    expect(idsOf(bands.archived)).toEqual([13]);
  });

  it('folds umlauts and case when matching the name', () => {
    expect(idsOf(toGroupRegisterBands(ALL, 'grosse', ALL_GROUPS_FILTER_ID).running)).toEqual([1]);
  });

  it('combines the query with the facet', () => {
    expect(countBandedGroups(toGroupRegisterBands(ALL, 'musik', NO_ADMIN_GROUPS_FILTER_ID))).toBe(
      0,
    );
  });
});

describe('toManagedGroupsLead', () => {
  it('leaves the open work to the chips and states what the register holds', () => {
    expect(toManagedGroupsLead(toGroupWorkFacets(ALL))).toBe('3 Gruppen stehen im Verzeichnis.');
  });

  it('says so calmly when nothing is open', () => {
    expect(toManagedGroupsLead(toGroupWorkFacets([GARDE]))).toBe(
      'Eine Gruppe steht im Verzeichnis. Alles gepflegt.',
    );
  });

  it('counts the listed groups in the plural', () => {
    expect(
      toManagedGroupsLead(toGroupWorkFacets([GARDE, group({ groupId: 2, name: 'Elferrat' })])),
    ).toBe('2 Gruppen stehen im Verzeichnis. Alles gepflegt.');
  });

  it('has its own line for an empty register', () => {
    expect(toManagedGroupsLead(toGroupWorkFacets([]))).toBe(
      'Noch steht keine Gruppe im Verzeichnis.',
    );
  });

  it('stays calm about open work and never claims everything is tended', () => {
    expect(toManagedGroupsLead(toGroupWorkFacets([GARDE, group({ groupId: 3, admins: [] })]))).toBe(
      '2 Gruppen stehen im Verzeichnis.',
    );
  });
});

describe('toRegisterMeta', () => {
  const bandsOf = (filter: GroupWorkFilterId): GroupRegisterBands =>
    toGroupRegisterBands(ALL, '', filter);

  it('keeps the archived ones out of the Verzeichnis count and names them apart', () => {
    expect(toRegisterMeta(ALL_GROUPS_FILTER_ID, bandsOf(ALL_GROUPS_FILTER_ID))).toBe(
      '3 Gruppen im Verzeichnis · 1 archiviert',
    );
  });

  it('drops the tail when nothing is archived', () => {
    expect(
      toRegisterMeta(ALL_GROUPS_FILTER_ID, toGroupRegisterBands([GARDE], '', ALL_GROUPS_FILTER_ID)),
    ).toBe('Eine Gruppe im Verzeichnis');
  });

  it('counts the archived band alone once only archived groups are banded', () => {
    expect(toRegisterMeta(ALL_GROUPS_FILTER_ID, bandsOf(ARCHIVED_GROUPS_FILTER_ID))).toBe(
      'Eine archivierte Gruppe',
    );
  });

  it('names the facet it is filtered to', () => {
    expect(toRegisterMeta(NO_KIND_GROUPS_FILTER_ID, bandsOf(NO_KIND_GROUPS_FILTER_ID))).toBe(
      '2 Gruppen ohne Gruppenart',
    );
  });

  it('says nothing matched when the bands are empty', () => {
    expect(
      toRegisterMeta(ALL_GROUPS_FILTER_ID, toGroupRegisterBands([], '', ALL_GROUPS_FILTER_ID)),
    ).toBe('Keine Gruppe passt');
  });
});
