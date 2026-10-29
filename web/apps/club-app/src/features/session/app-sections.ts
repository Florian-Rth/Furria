import type { KkHandoverName } from '@furria/ui/handover-stage';
import type { KkIconName } from '@furria/ui/KkIcon';
import type { KkScreenOrigin } from '@furria/ui/screen-declaration';
import type { KkShellDestination } from '@furria/ui/shell-destination';
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
export const EVENTS_PATH = '/events';
export const PROFILE_PATH = '/profile';
export const GALLERY_PATH = '/gallery';
export const NEWS_PATH = '/news';
export const SYSTEM_PATH = '/system';

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
export const EVENTS_TITLE = 'Veranstaltungen';
export const GALLERY_TITLE = 'Galerie';
export const NEWS_TITLE = 'Aktuelles';
export const SYSTEM_TITLE = 'System';

export const START_ORIGIN: KkScreenOrigin = { label: START_TITLE, to: START_PATH };
export const CLUB_ORIGIN: KkScreenOrigin = { label: CLUB_TITLE, to: CLUB_PATH };
export const CALENDAR_ORIGIN: KkScreenOrigin = { label: CALENDAR_TITLE, to: CALENDAR_PATH };
export const GROUPS_ORIGIN: KkScreenOrigin = { label: GROUPS_TITLE, to: GROUPS_PATH };
export const PROFILE_ORIGIN: KkScreenOrigin = { label: PROFILE_TITLE, to: PROFILE_PATH };
export const MORE_ORIGIN: KkScreenOrigin = { label: 'Mehr', to: MORE_PATH };
export const MANAGE_ORIGIN: KkScreenOrigin = { label: 'Verein verwalten', to: MANAGE_PATH };
export const EVENTS_ORIGIN: KkScreenOrigin = { label: EVENTS_TITLE, to: EVENTS_PATH };
export const GALLERY_ORIGIN: KkScreenOrigin = { label: GALLERY_TITLE, to: GALLERY_PATH };
export const NEWS_ORIGIN: KkScreenOrigin = { label: NEWS_TITLE, to: NEWS_PATH };
export const SYSTEM_ORIGIN: KkScreenOrigin = { label: SYSTEM_TITLE, to: SYSTEM_PATH };

export const AREA_HANDOVERS = {
  start: 'confetti',
  club: 'confetti',
  calendar: 'splitFlap',
  members: 'sway',
  groups: 'sway',
  profile: 'sway',
  announcements: 'confetti',
  manage: 'confetti',
  events: 'confetti',
  gallery: 'confetti',
  news: 'confetti',
  system: 'confetti',
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

export const EVENTS_KEYS: readonly [PermissionKey, ...PermissionKey[]] = [
  PERMISSION_KEYS.eventsManage,
];

export const GALLERY_KEYS: readonly [PermissionKey, ...PermissionKey[]] = [
  PERMISSION_KEYS.clubRead,
  PERMISSION_KEYS.galleryUpload,
  PERMISSION_KEYS.galleryManage,
  PERMISSION_KEYS.galleryPublish,
];

export const NEWS_KEYS: readonly [PermissionKey, ...PermissionKey[]] = [PERMISSION_KEYS.newsManage];

export const SYSTEM_KEYS: readonly [PermissionKey, ...PermissionKey[]] = [
  PERMISSION_KEYS.systemView,
];

export const GALLERY_SORT_KEYS: readonly [PermissionKey, ...PermissionKey[]] = [
  PERMISSION_KEYS.galleryUpload,
  PERMISSION_KEYS.galleryManage,
];

export const GALLERY_SECTION: AppSection = {
  id: 'gallery',
  label: GALLERY_TITLE,
  icon: 'gallery',
  to: GALLERY_PATH,
  meta: 'Fotos und Videos des Vereins',
  permissionKeys: GALLERY_KEYS,
};

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
  {
    id: 'events',
    label: EVENTS_TITLE,
    icon: 'events',
    to: EVENTS_PATH,
    meta: 'Abende mit Karten für die Website',
    permissionKeys: EVENTS_KEYS,
  },
  {
    id: 'news',
    label: NEWS_TITLE,
    icon: 'news',
    to: NEWS_PATH,
    meta: 'Meldungen für die Website schreiben',
    permissionKeys: NEWS_KEYS,
  },
  {
    id: 'system',
    label: SYSTEM_TITLE,
    icon: 'system',
    to: SYSTEM_PATH,
    meta: 'Datenbank, Medien, Speicher und Protokoll',
    permissionKeys: SYSTEM_KEYS,
  },
];

export const toPermittedSections = (
  sections: readonly AppSection[],
  permissionKeys: readonly string[],
): AppSection[] =>
  sections.filter((section) =>
    Boolean(section.permissionKeys?.some((key) => permissionKeys.includes(key))),
  );
