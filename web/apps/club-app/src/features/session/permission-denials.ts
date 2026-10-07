import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const DENIED_MESSAGES: Partial<Record<PermissionKey, string>> = {
  [PERMISSION_KEYS.personsManage]: 'Dir fehlt die Berechtigung für die Personenverwaltung.',
  [PERMISSION_KEYS.groupsManage]: 'Dir fehlt die Berechtigung für die Gruppenverwaltung.',
  [PERMISSION_KEYS.rolesManage]: 'Dir fehlt die Berechtigung für Rollen & Rechte.',
  [PERMISSION_KEYS.clubRead]: 'Dieser Bereich ist Mitgliedern vorbehalten.',
  [PERMISSION_KEYS.announcementsPost]: 'Dir fehlt die Berechtigung, Aushänge zu veröffentlichen.',
  [PERMISSION_KEYS.clubManage]: 'Dir fehlt die Berechtigung für Vereinsdaten, Sessions und Orte.',
  [PERMISSION_KEYS.keyHoldingsManage]: 'Dir fehlt die Berechtigung für die Schlüsselverwaltung.',
  [PERMISSION_KEYS.boardManage]: 'Dir fehlt die Berechtigung für den Vorstand.',
  [PERMISSION_KEYS.calendarManageClub]: 'Dir fehlt die Berechtigung, Vereinstermine zu verwalten.',
  [PERMISSION_KEYS.accountsManage]: 'Dir fehlt die Berechtigung für die Zugänge.',
  [PERMISSION_KEYS.membershipApplicationsDecide]:
    'Dir fehlt die Berechtigung, über Beitrittsanträge zu entscheiden.',
};

const FALLBACK_MESSAGE = 'Dir fehlt die Berechtigung für diese Seite.';

export const MANAGE_DENIED_MESSAGE = 'Dir fehlt die Berechtigung für die Verwaltung.';

export const NO_PERSON_MESSAGE = 'Dieser Zugang gehört zu keiner Person und hat kein Profil.';

export const deniedMessageOf = (permissionKey: PermissionKey): string =>
  DENIED_MESSAGES[permissionKey] ?? FALLBACK_MESSAGE;
