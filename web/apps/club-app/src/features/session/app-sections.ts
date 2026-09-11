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
}

export type AppSectionGroupId = 'main' | 'my-groups' | 'manage';

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

export const APP_SECTIONS: AppSection[] = [
  { id: 'overview', label: 'Übersicht', icon: 'overview', to: OVERVIEW_PATH },
  { id: 'events', label: 'Veranstaltungen', icon: 'events', to: null },
  { id: 'live', label: 'Live-Regie', icon: 'live', to: null },
  { id: 'members', label: 'Mitglieder', icon: 'members', to: MEMBERS_PATH },
  { id: 'groups', label: 'Gruppen', icon: 'group', to: GROUPS_PATH },
  { id: 'fees', label: 'Beitrag', icon: 'fees', to: null },
  { id: 'gallery', label: 'Galerie', icon: 'gallery', to: null },
  { id: 'wardrobe', label: 'Klamotten', icon: 'wardrobe', to: null },
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
    label: 'Gruppen',
    icon: 'group',
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

  return groups;
};

const OVERVIEW_TITLE = 'Übersicht';

interface SectionTitle {
  prefix: string;
  title: string;
}

const SECTION_TITLES: readonly SectionTitle[] = [
  { prefix: '/manage/persons', title: 'Personenverwaltung' },
  { prefix: '/manage/groups', title: 'Gruppenverwaltung' },
  { prefix: '/manage/roles', title: 'Rollen & Rechte' },
  { prefix: '/my-groups', title: 'Meine Gruppe' },
  { prefix: MEMBERS_PATH, title: 'Mitglieder' },
  { prefix: GROUPS_PATH, title: 'Gruppen' },
  { prefix: PROFILE_PATH, title: 'Profil' },
];

export const resolveSectionTitle = (pathname: string): string => {
  const match = SECTION_TITLES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return match?.title ?? OVERVIEW_TITLE;
};
