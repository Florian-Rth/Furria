import { describe, expect, it } from 'vitest';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import type { AppSection } from './app-sections';
import {
  APP_SECTIONS,
  buildNavGroups,
  isNavMatchActive,
  LATER_SECTIONS,
  resolveSectionTitle,
  toMyGroupId,
  toNavMatch,
} from './app-sections';

const section = (overrides: Partial<AppSection>): AppSection => ({
  id: 'members',
  label: 'Mitglieder',
  icon: 'members',
  to: '/members',
  ...overrides,
});

describe('toNavMatch', () => {
  it('matches a list section fuzzily, so its detail routes keep the rail marked', () => {
    expect(toNavMatch(section({ to: '/manage/persons' }))).toEqual({
      to: '/manage/persons',
      params: undefined,
      fuzzy: true,
    });
  });

  it('matches one Gruppe of the rail exactly, so the others stay unmarked', () => {
    expect(toNavMatch(section({ to: '/my-groups/$groupId', params: { groupId: '3' } }))).toEqual({
      to: '/my-groups/$groupId',
      params: { groupId: '3' },
      fuzzy: false,
    });
  });

  it('never matches the overview fuzzily, which would mark it on every route', () => {
    expect(toNavMatch(section({ to: '/' }))?.fuzzy).toBe(false);
  });

  it('has nothing to match for a routeless section', () => {
    expect(toNavMatch(section({ to: null }))).toBeNull();
  });
});

describe('resolveSectionTitle', () => {
  it.each([
    { pathname: '/', expected: 'Übersicht' },
    { pathname: '/profile', expected: 'Profil' },
    { pathname: '/members', expected: 'Mitglieder' },
    { pathname: '/members/12', expected: 'Mitglieder' },
    { pathname: '/groups', expected: 'Gruppen' },
    { pathname: '/groups/3', expected: 'Gruppen' },
    { pathname: '/my-groups/3', expected: 'Meine Gruppe' },
    { pathname: '/my-groups', expected: 'Meine Gruppe' },
    { pathname: '/manage/groups', expected: 'Gruppenverwaltung' },
    { pathname: '/manage/persons/12', expected: 'Personenverwaltung' },
    { pathname: '/manage/roles', expected: 'Rollen & Rechte' },
    { pathname: '/membersXX', expected: 'Übersicht' },
    { pathname: '/unbekannt', expected: 'Übersicht' },
    { pathname: '', expected: 'Übersicht' },
  ])('titles $pathname as $expected', ({ pathname, expected }) => {
    expect(resolveSectionTitle(pathname)).toBe(expected);
  });

  it('names the Hub after the Gruppe the viewer opened, not after the nav group', () => {
    const myGroups = [
      { groupId: 3, name: 'Tanzgarde' },
      { groupId: 7, name: 'Elferrat' },
    ];

    expect(resolveSectionTitle('/my-groups/7', myGroups)).toBe('Elferrat');
  });

  it('falls back to the section noun for a Gruppe the viewer is not in', () => {
    expect(resolveSectionTitle('/my-groups/9', [{ groupId: 3, name: 'Tanzgarde' }])).toBe(
      'Meine Gruppe',
    );
  });

  it('never reads a Gruppe name out of another route', () => {
    expect(resolveSectionTitle('/members/3', [{ groupId: 3, name: 'Tanzgarde' }])).toBe(
      'Mitglieder',
    );
  });
});

describe('toMyGroupId', () => {
  it.each([
    { pathname: '/my-groups/3', expected: 3 },
    { pathname: '/my-groups/128', expected: 128 },
    { pathname: '/my-groups', expected: null },
    { pathname: '/my-groups/', expected: null },
    { pathname: '/my-groups/3/mitglieder', expected: null },
    { pathname: '/my-groups/0', expected: null },
    { pathname: '/my-groups/abc', expected: null },
    { pathname: '/members/3', expected: null },
  ])('reads $pathname as $expected', ({ pathname, expected }) => {
    expect(toMyGroupId(pathname)).toBe(expected);
  });
});

describe('buildNavGroups', () => {
  it('always opens with the unlabelled main group', () => {
    const [main] = buildNavGroups({ permissionKeys: [], myGroups: [] });

    expect(main?.id).toBe('main');
    expect(main?.label).toBeNull();
    expect(main?.sections).toEqual(APP_SECTIONS);
  });

  it('keeps every routeless entry out of the front row and in its own trailing group', () => {
    const groups = buildNavGroups({ permissionKeys: [], myGroups: [] });
    const last = groups.at(-1);

    expect(
      groups.flatMap((group) => group.sections).filter((section) => section.to === null),
    ).toEqual(LATER_SECTIONS);
    expect(last?.id).toBe('later');
    expect(last?.sections.every((section) => section.hint !== undefined)).toBe(true);
  });

  it('hangs the later group after Meine Gruppen and Verwaltung', () => {
    const groups = buildNavGroups({
      permissionKeys: [PERMISSION_KEYS.groupsManage],
      myGroups: [{ groupId: 3, name: 'Tanzgarde' }],
    });

    expect(groups.map((group) => group.id)).toEqual(['main', 'my-groups', 'manage', 'later']);
  });

  it('names one entry per Gruppe, sorted German, with its route params', () => {
    const groups = buildNavGroups({
      permissionKeys: [],
      myGroups: [
        { groupId: 7, name: 'Ältestenrat' },
        { groupId: 3, name: 'Tanzgarde' },
        { groupId: 5, name: 'Elferrat' },
      ],
    });

    expect(groups[1]).toEqual({
      id: 'my-groups',
      label: 'Meine Gruppen',
      sections: [
        {
          id: 'my-group-7',
          label: 'Ältestenrat',
          icon: 'group',
          to: '/my-groups/$groupId',
          params: { groupId: '7' },
        },
        {
          id: 'my-group-5',
          label: 'Elferrat',
          icon: 'group',
          to: '/my-groups/$groupId',
          params: { groupId: '5' },
        },
        {
          id: 'my-group-3',
          label: 'Tanzgarde',
          icon: 'group',
          to: '/my-groups/$groupId',
          params: { groupId: '3' },
        },
      ],
    });
  });

  it.each([
    { keys: [], expected: [] },
    { keys: [PERMISSION_KEYS.personsReadDetails], expected: [] },
    { keys: [PERMISSION_KEYS.groupsManage], expected: ['manage-groups'] },
    {
      keys: [PERMISSION_KEYS.rolesManage, PERMISSION_KEYS.personsManage],
      expected: ['manage-persons', 'manage-roles'],
    },
    {
      keys: [
        PERMISSION_KEYS.personsManage,
        PERMISSION_KEYS.groupsManage,
        PERMISSION_KEYS.rolesManage,
        PERMISSION_KEYS.personsReadDetails,
      ],
      expected: ['manage-persons', 'manage-groups', 'manage-roles'],
    },
  ])('opens Verwaltung for $keys with $expected', ({ keys, expected }) => {
    const manage = buildNavGroups({ permissionKeys: keys, myGroups: [] }).find(
      (group) => group.id === 'manage',
    );

    expect(manage?.sections.map((section) => section.id) ?? []).toEqual(expected);
  });
});

describe('isNavMatchActive', () => {
  const overview = { to: '/', params: undefined, fuzzy: false };
  const members = { to: '/members', params: undefined, fuzzy: true };
  const managePersons = { to: '/manage/persons', params: undefined, fuzzy: true };
  const myGroup = { to: '/my-groups/$groupId', params: { groupId: '1' }, fuzzy: false };

  it.each([
    { match: overview, pathname: '/', expected: true },
    { match: overview, pathname: '/members', expected: false },
    { match: overview, pathname: '/manage/persons', expected: false },
    { match: members, pathname: '/members', expected: true },
    { match: members, pathname: '/members/3', expected: true },
    { match: members, pathname: '/members/', expected: true },
    { match: members, pathname: '/manage/persons', expected: false },
    { match: managePersons, pathname: '/manage/persons/2', expected: true },
    { match: managePersons, pathname: '/manage/groups', expected: false },
    { match: myGroup, pathname: '/my-groups/1', expected: true },
    { match: myGroup, pathname: '/my-groups/4', expected: false },
  ])('rates $match.to on $pathname as $expected', ({ match, pathname, expected }) => {
    expect(isNavMatchActive(match, pathname)).toBe(expected);
  });

  it('never lets the overview swallow every other route', () => {
    const elsewhere = ['/members', '/groups', '/profile', '/manage/roles'];

    expect(elsewhere.some((pathname) => isNavMatchActive(overview, pathname))).toBe(false);
  });
});
