import type { KkHandoverName, KkIconName, KkScreenOrigin, KkShellDestination } from '@furria/ui';
import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export interface AppSection {
  id: string;
  label: string;
  icon: KkIconName;
  to: string | null;
  meta?: string;
  permissionKeys?: readonly PermissionKey[];
  hint?: string;
}

export const OVERVIEW_PATH = '/';
export const CLUB_PATH = '/club';
export const ANNOUNCEMENTS_PATH = '/announcements';
export const CALENDAR_PATH = '/calendar';
export const MEMBERS_PATH = '/members';
export const GROUPS_PATH = '/groups';
export const MORE_PATH = '/more';
export const MANAGE_PATH = '/manage';
export const PROFILE_PATH = '/profile';

export const OVERVIEW_SECTION = 'overview';
export const CLUB_SECTION = 'club';
export const MORE_SECTION = 'more';

export const OVERVIEW_TITLE = 'Übersicht';
export const CLUB_TITLE = 'Verein';

export const OVERVIEW_ORIGIN: KkScreenOrigin = { label: OVERVIEW_TITLE, to: OVERVIEW_PATH };
export const CLUB_ORIGIN: KkScreenOrigin = { label: CLUB_TITLE, to: CLUB_PATH };
export const GROUPS_ORIGIN: KkScreenOrigin = { label: 'Gruppen', to: GROUPS_PATH };
export const PROFILE_ORIGIN: KkScreenOrigin = { label: 'Profil', to: PROFILE_PATH };
export const MORE_ORIGIN: KkScreenOrigin = { label: 'Mehr', to: MORE_PATH };
export const MANAGE_ORIGIN: KkScreenOrigin = { label: 'Verein verwalten', to: MANAGE_PATH };

export const AREA_HANDOVERS = {
  overview: 'confetti',
  club: 'confetti',
  calendar: 'splitFlap',
  members: 'sway',
  groups: 'sway',
  profile: 'sway',
  announcements: 'fanfare',
  manage: 'fanfare',
  more: 'fanfare',
} as const satisfies Record<string, KkHandoverName>;

export const MANAGE_KEYS: readonly PermissionKey[] = [
  PERMISSION_KEYS.personsManage,
  PERMISSION_KEYS.groupsManage,
  PERMISSION_KEYS.rolesManage,
  PERMISSION_KEYS.boardManage,
  PERMISSION_KEYS.clubManage,
  PERMISSION_KEYS.keyHoldingsManage,
];

export const APP_DESTINATIONS: readonly KkShellDestination[] = [
  {
    id: OVERVIEW_SECTION,
    label: OVERVIEW_TITLE,
    icon: 'overview',
    activeIcon: 'home',
    to: OVERVIEW_PATH,
  },
  { id: CLUB_SECTION, label: CLUB_TITLE, icon: 'club', activeIcon: 'clubFilled', to: CLUB_PATH },
  { id: MORE_SECTION, label: 'Mehr', icon: 'more', activeIcon: 'moreFilled', to: MORE_PATH },
];

export const CLUB_SECTIONS: AppSection[] = [
  {
    id: 'members',
    label: 'Mitglieder',
    icon: 'members',
    to: MEMBERS_PATH,
    meta: 'Alle Personen im Verein',
  },
  {
    id: 'groups',
    label: 'Gruppen',
    icon: 'group',
    to: GROUPS_PATH,
    meta: 'Alle Gruppen des Vereins',
  },
  {
    id: 'calendar',
    label: 'Kalender',
    icon: 'calendar',
    to: CALENDAR_PATH,
    meta: 'Termine, Trainings und Sitzungen',
  },
  {
    id: 'announcements',
    label: 'Aushänge',
    icon: 'info',
    to: ANNOUNCEMENTS_PATH,
    meta: 'Mitteilungen des Vereins',
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
    id: 'manage-hub',
    label: 'Verein verwalten',
    icon: 'manage',
    to: MANAGE_PATH,
    meta: 'Daten des Vereins pflegen',
    permissionKeys: MANAGE_KEYS,
  },
];

export const toPermittedSections = (
  sections: readonly AppSection[],
  permissionKeys: readonly string[],
): AppSection[] =>
  sections.filter((section) =>
    Boolean(section.permissionKeys?.some((key) => permissionKeys.includes(key))),
  );
