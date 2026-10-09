import { describe, expect, it } from 'vitest';
import {
  findGroupKindEntry,
  groupKindUsageOf,
  isGroupKindArchivable,
  toGroupKindEntries,
  toGroupRegisterFlags,
} from './manage-groups-labels';
import type { ManagedGroupKind, ManagedGroupSummary } from './schemas';

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
  admins: [{ personId: 8, firstName: 'Birgit', lastName: 'Kühnel', portrait: null }],
  ...overrides,
});

const kind = (overrides: Partial<ManagedGroupKind>): ManagedGroupKind => ({
  groupKindId: 1,
  name: 'Garde',
  archivedOn: null,
  groupCount: 2,
  ...overrides,
});

const entryOf = (
  overrides: Partial<ManagedGroupKind>,
): ReturnType<typeof toGroupKindEntries>[number] => {
  const [entry] = toGroupKindEntries([kind(overrides)]);

  if (entry === undefined) {
    throw new Error('no entry');
  }

  return entry;
};

describe('toGroupRegisterFlags', () => {
  it.each([
    {
      scenario: 'names every gap of a running group before its group kind',
      overrides: { admins: [], memberCount: 0 },
      expected: ['no-admin', 'no-kind', 'no-people'],
    },
    {
      scenario: 'carries the group kind alone once nothing is missing',
      overrides: { groupKindId: 2, groupKindName: 'Garde' },
      expected: ['kind'],
    },
    {
      scenario: 'replaces the gaps of an archived group with its archive day',
      overrides: { archivedOn: '2026-09-12', admins: [], memberCount: 0 },
      expected: ['archived'],
    },
  ])('$scenario', ({ overrides, expected }) => {
    expect(toGroupRegisterFlags(group(overrides)).map((flag) => flag.id)).toEqual(expected);
  });
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
});

describe('findGroupKindEntry', () => {
  const entries = toGroupKindEntries([kind({ groupKindId: 1 })]);

  it.each([
    { scenario: 'no group kind is selected', groupKindId: null, expected: null },
    { scenario: 'an unknown id', groupKindId: 999, expected: null },
    { scenario: 'the selected group kind', groupKindId: 1, expected: 1 },
  ])('finds $expected for $scenario', ({ groupKindId, expected }) => {
    expect(findGroupKindEntry(entries, groupKindId)?.groupKindId ?? null).toBe(expected);
  });
});

describe('isGroupKindArchivable', () => {
  it.each([
    { archivedOn: null, groupCount: 0, expected: true },
    { archivedOn: null, groupCount: 1, expected: false },
    { archivedOn: '2026-01-01', groupCount: 0, expected: false },
  ])(
    'reads archivedOn $archivedOn with $groupCount groups as $expected',
    ({ archivedOn, groupCount, expected }) => {
      expect(isGroupKindArchivable(entryOf({ archivedOn, groupCount }))).toBe(expected);
    },
  );
});

describe('groupKindUsageOf', () => {
  it.each([
    { archivedOn: null, groupCount: 0, expected: 'unused' },
    { archivedOn: null, groupCount: 2, expected: 'used' },
    { archivedOn: '2026-09-12', groupCount: 0, expected: 'archived' },
  ])(
    'reads archivedOn $archivedOn with $groupCount groups as $expected',
    ({ archivedOn, groupCount, expected }) => {
      expect(groupKindUsageOf(entryOf({ archivedOn, groupCount }))).toBe(expected);
    },
  );
});
