import type { KkIconName, KkScreenOrigin, KkShellDestination } from '@furria/ui';
import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export interface AppSection {
  id: string;
  label: string;
  icon: KkIconName;
  to: string | null;
  meta?: string;
  permissionKey?: PermissionKey;
  hint?: string;
}

export const ANNOUNCEMENTS_PATH = '/announcements';
export const OVERVIEW_PATH = '/';
export const CLUB_PATH = '/club';
export const MORE_PATH = '/more';
export const PROFILE_PATH = '/profile';
export const MEMBERS_PATH = '/members';
export const GROUPS_PATH = '/groups';
export const CALENDAR_PATH = '/calendar';

export const OVERVIEW_SECTION = 'overview';
export const CLUB_SECTION = 'club';
export const MORE_SECTION = 'more';

export const CLUB_ORIGIN: KkScreenOrigin = { label: 'Verein', to: CLUB_PATH };
export const MORE_ORIGIN: KkScreenOrigin = { label: 'Mehr', to: MORE_PATH };

export const APP_DESTINATIONS: readonly KkShellDestination[] = [
  {
    id: OVERVIEW_SECTION,
    label: 'Übersicht',
    icon: 'overview',
    activeIcon: 'home',
    to: OVERVIEW_PATH,
  },
  { id: CLUB_SECTION, label: 'Verein', icon: 'club', activeIcon: 'clubFilled', to: CLUB_PATH },
  { id: MORE_SECTION, label: 'Mehr', icon: 'more', activeIcon: 'moreFilled', to: MORE_PATH },
];

export const CLUB_SECTIONS: AppSection[] = [
  {
    id: 'members',
    label: 'Mitglieder',
    icon: 'members',
    to: MEMBERS_PATH,
    meta: 'Wer mit dem FCC verbunden ist',
  },
  {
    id: 'groups',
    label: 'Gruppen',
    icon: 'group',
    to: GROUPS_PATH,
    meta: 'Garden, Elferrat und alle anderen',
  },
];

const LATER_HINT = 'bald';

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

export const toPermittedSections = (
  sections: readonly AppSection[],
  permissionKeys: readonly string[],
): AppSection[] =>
  sections.filter(
    (section) =>
      section.permissionKey !== undefined && permissionKeys.includes(section.permissionKey),
  );
