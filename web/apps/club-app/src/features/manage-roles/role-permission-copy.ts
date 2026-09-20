import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export interface RolePermissionCopy {
  title: string;
  line: string;
}

const PERMISSION_COPY: Record<PermissionKey, RolePermissionCopy> = {
  [PERMISSION_KEYS.personsReadDetails]: {
    title: 'Kontaktdaten aller Personen sehen',
    line: 'Telefon, E-Mail und Adresse — auch wenn die Person sie für Mitglieder nicht freigegeben hat.',
  },
  [PERMISSION_KEYS.personsManage]: {
    title: 'Personen und Mitgliedschaften pflegen',
    line: 'Personen anlegen, Stammdaten ändern, Zeiträume, Ruhezeiten und Beitragsermäßigungen anlegen und beenden.',
  },
  [PERMISSION_KEYS.groupsManage]: {
    title: 'Gruppen verwalten',
    line: 'Gruppen anlegen, bearbeiten, archivieren und jede Zugehörigkeit oder Gruppen-Admin-Rolle überschreiben.',
  },
  [PERMISSION_KEYS.rolesManage]: {
    title: 'Rollen und Rechte verwalten',
    line: 'Rollen anlegen, ihre Rechte ändern und Inhaberschaften eintragen. Wer das hat, kann sich alles andere selbst geben.',
  },
  [PERMISSION_KEYS.clubRead]: {
    title: 'Den Verein sehen',
    line: 'Ergibt sich aus einer laufenden Mitgliedschaft und lässt sich nicht über eine Rolle vergeben.',
  },
  [PERMISSION_KEYS.announcementsPost]: {
    title: 'Aushänge schreiben',
    line: 'Etwas an den Aushang hängen, ändern und wieder abnehmen — auch die Aushänge anderer.',
  },
  [PERMISSION_KEYS.clubManage]: {
    title: 'Sessionseinträge und Orte pflegen',
    line: 'Motto, Nummer und Zeitraum einer Session eintragen und ändern, Orte anlegen, bearbeiten und archivieren.',
  },
  [PERMISSION_KEYS.keyHoldingsManage]: {
    title: 'Schlüssel führen',
    line: 'Ausgeben und zurücknehmen, wer für welchen Ort einen Schlüssel in der Hand hat. Gemeint ist das Metall, nicht die Berechtigung.',
  },
  [PERMISSION_KEYS.boardManage]: {
    title: 'Vorstand führen',
    line: 'Vorstandsfunktionen anlegen und archivieren, Sitze besetzen und beenden. Die Rolle, die eine Funktion mitbringt, bleibt davon unberührt.',
  },
  [PERMISSION_KEYS.calendarManageClub]: {
    title: 'Vereinstermine führen',
    line: 'Kalendereinträge anlegen, ändern und absagen, die dem Verein selbst gehören — nicht die einer Gruppe.',
  },
};

const KNOWN_KEYS: readonly PermissionKey[] = Object.values(PERMISSION_KEYS);

export const isPermissionKey = (value: string): value is PermissionKey =>
  KNOWN_KEYS.some((known) => known === value);

export const toPermissionCopy = (key: PermissionKey): RolePermissionCopy => PERMISSION_COPY[key];
