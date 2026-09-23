import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

const DENIED_MESSAGES: Partial<Record<PermissionKey, string>> = {
  [PERMISSION_KEYS.personsManage]:
    'Die Personenverwaltung ist an eine Rolle gebunden. Du hast sie gerade nicht.',
  [PERMISSION_KEYS.groupsManage]:
    'Die Gruppenverwaltung ist an eine Rolle gebunden. Du hast sie gerade nicht.',
  [PERMISSION_KEYS.rolesManage]:
    'Rollen & Rechte ist an eine Rolle gebunden. Du hast sie gerade nicht.',
  [PERMISSION_KEYS.clubRead]:
    'Der Verein steht Mitgliedern offen. Deine Mitgliedschaft läuft gerade nicht.',
  [PERMISSION_KEYS.announcementsPost]:
    'Etwas an den Aushang zu hängen ist an eine Rolle gebunden. Du hast sie gerade nicht.',
  [PERMISSION_KEYS.clubManage]:
    'Sessionseinträge und Orte sind an eine Rolle gebunden. Du hast sie gerade nicht.',
  [PERMISSION_KEYS.keyHoldingsManage]:
    'Die Schlüssel sind an eine Rolle gebunden. Du hast sie gerade nicht.',
  [PERMISSION_KEYS.boardManage]:
    'Der Vorstand ist an eine Rolle gebunden. Du hast sie gerade nicht.',
  [PERMISSION_KEYS.calendarManageClub]:
    'Vereinstermine zu führen ist an eine Rolle gebunden. Du hast sie gerade nicht.',
};

const FALLBACK_MESSAGE = 'Diese Seite ist an eine Rolle gebunden. Du hast sie gerade nicht.';

export const MANAGE_DENIED_MESSAGE =
  'Die Verwaltung ist an eine Rolle gebunden. Du hast sie gerade nicht.';

export const deniedMessageOf = (permissionKey: PermissionKey): string =>
  DENIED_MESSAGES[permissionKey] ?? FALLBACK_MESSAGE;
