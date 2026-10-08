import { describe, expect, it } from 'vitest';
import type { PublicGroup } from '@/lib/public-groups/schemas';
import type { GroupsIntroKind } from './groups-content';
import {
  countRecruitingGroups,
  groupByKind,
  OTHER_GROUPS_TITLE,
  resolveGroupsIntroKind,
  resolveSectionTitle,
} from './groups-content';

const group = (
  groupId: number,
  isRecruiting: boolean,
  groupKindName: string | null = null,
): PublicGroup => ({
  groupId,
  name: `Gruppe ${groupId}`,
  description: 'Beschreibung',
  isRecruiting,
  groupKindName,
  foundedYear: null,
  tone: null,
});

describe('countRecruitingGroups', () => {
  it('counts only the groups that are open', () => {
    expect(countRecruitingGroups([group(1, true), group(2, false), group(3, true)])).toBe(2);
  });
});

describe('resolveGroupsIntroKind', () => {
  it.each<[number, number, GroupsIntroKind]>([
    [6, 0, 'none'],
    [1, 0, 'none'],
    [1, 1, 'sole'],
    [6, 6, 'all'],
    [6, 2, 'some'],
  ])('reads %i groups with %i recruiting as %s', (total, recruiting, kind) => {
    expect(resolveGroupsIntroKind(total, recruiting)).toBe(kind);
  });
});

describe('groupByKind', () => {
  it('orders the kinds by German name and keeps groups without a kind last', () => {
    const sections = groupByKind([
      group(1, false, null),
      group(2, false, 'Tanzgarde'),
      group(3, false, 'Älteste'),
      group(4, false, 'Büttenrede'),
      group(5, false, 'Tanzgarde'),
    ]);

    expect(sections.map((section) => section.kindName)).toEqual([
      'Älteste',
      'Büttenrede',
      'Tanzgarde',
      null,
    ]);
  });

  it('keeps the groups of one kind in the order they arrived', () => {
    const [tanzgarde] = groupByKind([group(5, false, 'Tanzgarde'), group(2, false, 'Tanzgarde')]);

    expect(tanzgarde?.groups.map((member) => member.groupId)).toEqual([5, 2]);
  });
});

describe('resolveSectionTitle', () => {
  it.each([
    ['Tanzgarde', 2, 'Tanzgarde'],
    [null, 2, OTHER_GROUPS_TITLE],
    [null, 1, null],
  ])('titles kind %s among %i sections as %s', (kindName, sectionCount, expected) => {
    expect(resolveSectionTitle(kindName, sectionCount)).toBe(expected);
  });
});
