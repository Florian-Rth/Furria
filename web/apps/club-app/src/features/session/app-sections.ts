import type { KkIconName } from '@furria/ui';
import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export interface AppSection {
  id: string;
  label: string;
  icon: KkIconName;
  to: string | null;
  params?: Record<string, string>;
  permissionKey?: PermissionKey;
  hint?: string;
}

export type AppSectionGroupId = 'main' | 'my-groups' | 'manage' | 'later';

export interface AppSectionGroup {
  id: AppSectionGroupId;
  label: string | null;
  sections: AppSection[];
}

export const OVERVIEW_PATH = '/';
export const PROFILE_PATH = '/profile';
export const MEMBERS_PATH = '/members';
export const GROUPS_PATH = '/groups';
export const MY_GROUP_PATH = '/my-groups/$groupId';

const LATER_HINT = 'bald';

export const APP_SECTIONS: AppSection[] = [
  { id: 'overview', label: 'Übersicht', icon: 'overview', to: OVERVIEW_PATH },
  { id: 'members', label: 'Mitglieder', icon: 'members', to: MEMBERS_PATH },
  { id: 'groups', label: 'Gruppen', icon: 'group', to: GROUPS_PATH },
];

export const LATER_SECTIONS: AppSection[] = [
  { id: 'events', label: 'Veranstaltungen', icon: 'events', to: null, hint: LATER_HINT },
  { id: 'live', label: 'Live-Regie', icon: 'live', to: null, hint: LATER_HINT },
  { id: 'fees', label: 'Beitrag', icon: 'fees', to: null, hint: LATER_HINT },
  { id: 'gallery', label: 'Bildergalerie', icon: 'gallery', to: null, hint: LATER_HINT },
  { id: 'wardrobe', label: 'Klamotten', icon: 'wardrobe', to: null, hint: LATER_HINT },
];

export const MANAGE_SECTIONS: AppSection[] = [
  {
    id: 'manage-persons',
    label: 'Personen',
    icon: 'person',
    to: '/manage/persons',
    permissionKey: PERMISSION_KEYS.personsManage,
  },
  {
    id: 'manage-groups',
    label: 'Gruppenverwaltung',
    icon: 'manage',
    to: '/manage/groups',
    permissionKey: PERMISSION_KEYS.groupsManage,
  },
  {
    id: 'manage-roles',
    label: 'Rollen & Rechte',
    icon: 'permissions',
    to: '/manage/roles',
    permissionKey: PERMISSION_KEYS.rolesManage,
  },
];

export interface NavMatch {
  to: string;
  params: Record<string, string> | undefined;
  fuzzy: boolean;
}

const toNavHref = (match: NavMatch): string =>
  match.params === undefined
    ? match.to
    : Object.entries(match.params).reduce(
        (path, [name, value]) => path.replace(`$${name}`, value),
        match.to,
      );

const toComparablePath = (path: string): string =>
  path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;

export const isNavMatchActive = (match: NavMatch, pathname: string): boolean => {
  const href = toComparablePath(toNavHref(match));
  const current = toComparablePath(pathname);

  if (current === href) {
    return true;
  }

  return match.fuzzy && current.startsWith(`${href}/`);
};

export const toNavMatch = (section: AppSection): NavMatch | null => {
  if (section.to === null) {
    return null;
  }

  const ownsDetailRoutes = section.params === undefined && section.to !== OVERVIEW_PATH;

  return { to: section.to, params: section.params, fuzzy: ownsDetailRoutes };
};

export interface NavGroupRef {
  groupId: number;
  name: string;
}

export interface NavGroupInput {
  permissionKeys: readonly string[];
  myGroups: readonly NavGroupRef[];
}

const MY_GROUPS_LABEL = 'Meine Gruppen';
const MANAGE_LABEL = 'Verwaltung';
const LATER_LABEL = 'Kommt später';

const toMyGroupSection = (group: NavGroupRef): AppSection => ({
  id: `my-group-${group.groupId}`,
  label: group.name,
  icon: 'group',
  to: MY_GROUP_PATH,
  params: { groupId: String(group.groupId) },
});

const byName = (left: NavGroupRef, right: NavGroupRef): number =>
  left.name.localeCompare(right.name, 'de');

export const buildNavGroups = ({ permissionKeys, myGroups }: NavGroupInput): AppSectionGroup[] => {
  const groups: AppSectionGroup[] = [{ id: 'main', label: null, sections: APP_SECTIONS }];

  if (myGroups.length > 0) {
    groups.push({
      id: 'my-groups',
      label: MY_GROUPS_LABEL,
      sections: [...myGroups].sort(byName).map(toMyGroupSection),
    });
  }

  const managed = MANAGE_SECTIONS.filter(
    (section) =>
      section.permissionKey !== undefined && permissionKeys.includes(section.permissionKey),
  );

  if (managed.length > 0) {
    groups.push({ id: 'manage', label: MANAGE_LABEL, sections: managed });
  }

  groups.push({ id: 'later', label: LATER_LABEL, sections: LATER_SECTIONS });

  return groups;
};

const OVERVIEW_TITLE = 'Übersicht';

interface SectionTitle {
  prefix: string;
  title: string;
}

const MY_GROUP_PREFIX = '/my-groups/';
const GROUP_ID_PATTERN = /^[1-9]\d*$/;

export const toMyGroupId = (pathname: string): number | null => {
  if (!pathname.startsWith(MY_GROUP_PREFIX)) {
    return null;
  }

  const [segment, ...rest] = pathname.slice(MY_GROUP_PREFIX.length).split('/');

  if (rest.length > 0 || segment === undefined || !GROUP_ID_PATTERN.test(segment)) {
    return null;
  }

  return Number(segment);
};

const SECTION_TITLES: readonly SectionTitle[] = [
  { prefix: '/manage/persons', title: 'Personenverwaltung' },
  { prefix: '/manage/groups', title: 'Gruppenverwaltung' },
  { prefix: '/manage/roles', title: 'Rollen & Rechte' },
  { prefix: '/my-groups', title: 'Meine Gruppe' },
  { prefix: MEMBERS_PATH, title: 'Mitglieder' },
  { prefix: GROUPS_PATH, title: 'Gruppen' },
  { prefix: PROFILE_PATH, title: 'Profil' },
];

const NO_GROUPS: readonly NavGroupRef[] = [];

export const resolveSectionTitle = (
  pathname: string,
  myGroups: readonly NavGroupRef[] = NO_GROUPS,
): string => {
  const groupId = toMyGroupId(pathname);
  const ownGroup = myGroups.find((group) => group.groupId === groupId);

  if (ownGroup !== undefined) {
    return ownGroup.name;
  }

  const match = SECTION_TITLES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return match?.title ?? OVERVIEW_TITLE;
};
