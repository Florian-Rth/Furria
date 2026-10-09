import { describe, expect, it } from 'vitest';
import type { PortraitPersonRef } from '@/lib/api/schemas';
import type { AdminRoster } from './groups-labels';
import {
  ALL_GROUPS_FILTER_ID,
  adminRosterOf,
  filterGroups,
  noGroupMatchOf,
  RECRUITING_FILTER_ID,
  SETTLED_FILTER_ID,
  toGroupsSections,
  toRecruitingFilterOptions,
} from './groups-labels';
import type { GroupSummary } from './schemas';

const person = (personId: number, firstName: string): PortraitPersonRef => ({
  personId,
  firstName,
  lastName: 'Kaiser',
  portrait: null,
});

const summary = (overrides: Partial<GroupSummary> & { groupId: number }): GroupSummary => ({
  name: 'Große Garde',
  picture: null,
  description: '',
  isRecruiting: false,
  groupKindName: null,
  foundedYear: null,
  tone: null,
  memberCount: 0,
  memberPreview: [],
  admins: [],
  viewerIsMember: false,
  viewerIsAdmin: false,
  ...overrides,
});

describe('adminRosterOf', () => {
  const anna = person(18, 'Anna');
  const katrin = person(19, 'Katrin');

  it.each<[string, PortraitPersonRef[], AdminRoster]>([
    ['no admin', [], { kind: 'none' }],
    ['one admin', [anna], { kind: 'one', first: anna }],
    ['two admins', [anna, katrin], { kind: 'two', first: anna, second: katrin }],
    [
      'four admins',
      [anna, katrin, person(20, 'Jens'), person(21, 'Mara')],
      { kind: 'more', first: anna, second: katrin, furtherCount: 2 },
    ],
  ])('names the first two of %s', (_case, admins, expected) => {
    expect(adminRosterOf(admins)).toEqual(expected);
  });
});

describe('filterGroups', () => {
  const groups: readonly GroupSummary[] = [
    summary({ groupId: 1, name: 'Große Garde', isRecruiting: true }),
    summary({ groupId: 2, name: 'Elferrat' }),
    summary({ groupId: 3, name: 'Küche und Theke', isRecruiting: true }),
  ];

  it.each([
    ['every group under Alle', '', ALL_GROUPS_FILTER_ID, [1, 2, 3]],
    ['only the recruiting groups', '', RECRUITING_FILTER_ID, [1, 3]],
    ['only the settled groups', '', SETTLED_FILTER_ID, [2]],
    ['a name typed without its ß', 'grosse', ALL_GROUPS_FILTER_ID, [1]],
    ['a name typed without its umlaut', 'kuche', ALL_GROUPS_FILTER_ID, [3]],
    ['the query inside the chosen chip', 'elferrat', RECRUITING_FILTER_ID, []],
  ])('keeps %s', (_case, query, status, expected) => {
    expect(filterGroups(groups, { query, status }).map((group) => group.groupId)).toEqual(expected);
  });
});

describe('toRecruitingFilterOptions', () => {
  it('counts all, recruiting and settled from the same list', () => {
    const groups: readonly GroupSummary[] = [
      summary({ groupId: 1, isRecruiting: true }),
      summary({ groupId: 2 }),
      summary({ groupId: 3 }),
    ];

    expect(toRecruitingFilterOptions(groups).map((option) => [option.id, option.count])).toEqual([
      [ALL_GROUPS_FILTER_ID, 3],
      [RECRUITING_FILTER_ID, 1],
      [SETTLED_FILTER_ID, 2],
    ]);
  });
});

describe('noGroupMatchOf', () => {
  it.each([
    ['a typed query', '  Garde ', ALL_GROUPS_FILTER_ID, 'query'],
    ['a chip that narrows the list', '', RECRUITING_FILTER_ID, 'status'],
    ['the cold case under Alle', '', ALL_GROUPS_FILTER_ID, 'noGroups'],
  ])('explains %s', (_case, query, status, expected) => {
    expect(noGroupMatchOf(query, status).kind).toBe(expected);
  });
});

describe('toGroupsSections', () => {
  const sectionsOf = (groups: readonly GroupSummary[]): [string, number[]][] =>
    toGroupsSections(groups).map((section) => [
      section.id,
      section.groups.map((group) => group.groupId),
    ]);

  it.each<[string, GroupSummary[], [string, number[]][]]>([
    ['no group', [], []],
    ['a viewer in no group', [summary({ groupId: 1 }), summary({ groupId: 2 })], [['all', [1, 2]]]],
    [
      'a viewer in every group',
      [summary({ groupId: 1, viewerIsMember: true }), summary({ groupId: 2, viewerIsAdmin: true })],
      [['mine', [1, 2]]],
    ],
    [
      'a viewer in some groups',
      [
        summary({ groupId: 1 }),
        summary({ groupId: 2, viewerIsAdmin: true }),
        summary({ groupId: 3 }),
        summary({ groupId: 4, viewerIsMember: true }),
      ],
      [
        ['mine', [2, 4]],
        ['rest', [1, 3]],
      ],
    ],
  ])('racks the groups of %s', (_case, groups, expected) => {
    expect(sectionsOf(groups)).toEqual(expected);
  });
});
