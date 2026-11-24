import { describe, expect, it } from 'vitest';
import { isGroupKindArchivable, toGroupKindEntries } from './manage-groups-labels';
import type { ManagedGroupKind } from './schemas';

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

describe('isGroupKindArchivable', () => {
  it.each([
    { archivedOn: null, groupCount: 0, expected: true },
    { archivedOn: null, groupCount: 1, expected: false },
  ])(
    'reads archivedOn $archivedOn with $groupCount groups as $expected',
    ({ archivedOn, groupCount, expected }) => {
      expect(isGroupKindArchivable(entryOf({ archivedOn, groupCount }))).toBe(expected);
    },
  );
});
