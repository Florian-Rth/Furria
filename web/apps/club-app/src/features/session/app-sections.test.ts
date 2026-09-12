import { describe, expect, it } from 'vitest';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { APP_SECTIONS, buildNavGroups, LATER_SECTIONS, resolveSectionTitle } from './app-sections';

describe('resolveSectionTitle', () => {
  it.each([
    { pathname: '/', expected: 'Übersicht' },
    { pathname: '/profile', expected: 'Profil' },
    { pathname: '/members', expected: 'Mitglieder' },
    { pathname: '/members/12', expected: 'Mitglieder' },
    { pathname: '/groups', expected: 'Gruppen' },
    { pathname: '/groups/3', expected: 'Gruppen' },
    { pathname: '/my-groups/3', expected: 'Meine Gruppe' },
    { pathname: '/manage/groups', expected: 'Gruppenverwaltung' },
    { pathname: '/manage/persons/12', expected: 'Personenverwaltung' },
    { pathname: '/manage/roles', expected: 'Rollen & Rechte' },
    { pathname: '/membersXX', expected: 'Übersicht' },
    { pathname: '/unbekannt', expected: 'Übersicht' },
    { pathname: '', expected: 'Übersicht' },
  ])('titles $pathname as $expected', ({ pathname, expected }) => {
    expect(resolveSectionTitle(pathname)).toBe(expected);
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
