import type { KkHandoverName, KkIconName, KkScreenOrigin, KkShellDestination } from '@furria/ui';
import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export interface AppSection {
  id: string;
  label: string;
  icon: KkIconName;
  to: string;
  meta?: string;
  permissionKeys?: readonly PermissionKey[];
}

export const START_PATH = '/';
export const CLUB_PATH = '/club';
export const ANNOUNCEMENTS_PATH = '/announcements';
export const CALENDAR_PATH = '/calendar';
export const MEMBERS_PATH = '/members';
export const GROUPS_PATH = '/groups';
export const MORE_PATH = '/more';
export const MANAGE_PATH = '/manage';
export const PROFILE_PATH = '/profile';

export const START_SECTION = 'start';
export const CLUB_SECTION = 'club';
export const CALENDAR_SECTION = 'calendar';
export const GROUPS_SECTION = 'groups';
export const MORE_SECTION = 'more';

export const START_TITLE = 'Start';
export const CLUB_TITLE = 'Verein';
export const CALENDAR_TITLE = 'Kalender';
export const GROUPS_TITLE = 'Gruppen';
export const PROFILE_TITLE = 'Profil';

export const START_ORIGIN: KkScreenOrigin = { label: START_TITLE, to: START_PATH };
export const CLUB_ORIGIN: KkScreenOrigin = { label: CLUB_TITLE, to: CLUB_PATH };
export const CALENDAR_ORIGIN: KkScreenOrigin = { label: CALENDAR_TITLE, to: CALENDAR_PATH };
export const GROUPS_ORIGIN: KkScreenOrigin = { label: GROUPS_TITLE, to: GROUPS_PATH };
export const PROFILE_ORIGIN: KkScreenOrigin = { label: PROFILE_TITLE, to: PROFILE_PATH };
export const MORE_ORIGIN: KkScreenOrigin = { label: 'Mehr', to: MORE_PATH };
export const MANAGE_ORIGIN: KkScreenOrigin = { label: 'Verein verwalten', to: MANAGE_PATH };

export const AREA_HANDOVERS = {
  start: 'confetti',
  club: 'confetti',
  calendar: 'splitFlap',
  members: 'sway',
  groups: 'sway',
  profile: 'sway',
  announcements: 'confetti',
  manage: 'confetti',
  more: 'confetti',
} as const satisfies Record<string, KkHandoverName>;

export const MANAGE_KEYS: readonly PermissionKey[] = [
  PERMISSION_KEYS.personsManage,
  PERMISSION_KEYS.groupsManage,
  PERMISSION_KEYS.rolesManage,
  PERMISSION_KEYS.boardManage,
  PERMISSION_KEYS.clubManage,
  PERMISSION_KEYS.keyHoldingsManage,
  PERMISSION_KEYS.accountsManage,
  PERMISSION_KEYS.personsDelete,
  PERMISSION_KEYS.membershipApplicationsDecide,
];

export const APP_DESTINATIONS: readonly KkShellDestination[] = [
  { id: START_SECTION, label: START_TITLE, icon: 'overview', activeIcon: 'home', to: START_PATH },
  { id: CLUB_SECTION, label: CLUB_TITLE, icon: 'club', activeIcon: 'clubFilled', to: CLUB_PATH },
  {
    id: CALENDAR_SECTION,
    label: CALENDAR_TITLE,
    icon: 'calendar',
    activeIcon: 'calendarFilled',
    to: CALENDAR_PATH,
  },
  {
    id: GROUPS_SECTION,
    label: GROUPS_TITLE,
    icon: 'group',
    activeIcon: 'groupFilled',
    to: GROUPS_PATH,
  },
  { id: MORE_SECTION, label: 'Mehr', icon: 'more', activeIcon: 'moreFilled', to: MORE_PATH },
];

const MANAGING_LOGIN_SECTIONS: ReadonlySet<string> = new Set([START_SECTION, MORE_SECTION]);

export const MANAGING_LOGIN_DESTINATIONS: readonly KkShellDestination[] = APP_DESTINATIONS.filter(
  (destination) => MANAGING_LOGIN_SECTIONS.has(destination.id),
);

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
    label: GROUPS_TITLE,
    icon: 'group',
    to: GROUPS_PATH,
    meta: 'Alle Gruppen des Vereins',
  },
  {
    id: 'calendar',
    label: CALENDAR_TITLE,
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
