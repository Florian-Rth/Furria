import type { PermissionKey } from '@/lib/api/schemas';
import { PERMISSION_KEYS } from '@/lib/api/schemas';

export interface RolePermissionCopy {
  title: string;
  line: string;
}

const PERMISSION_COPY: Record<PermissionKey, RolePermissionCopy> = {
  [PERMISSION_KEYS.personsReadDetails]: {
    title: 'Kontaktdaten aller Personen sehen',
    line: 'Telefon, E-Mail und Adresse, auch wenn sie nicht freigegeben sind.',
  },
  [PERMISSION_KEYS.personsManage]: {
    title: 'Personen und Mitgliedschaften pflegen',
    line: 'Personen anlegen und Stammdaten ändern; Mitgliedschaften, Ruhezeiten und Beitragsermäßigungen pflegen. Personen archivieren und wiederherstellen.',
  },
  [PERMISSION_KEYS.personsDelete]: {
    title: 'Personen endgültig löschen',
    line: 'Eine Person mit allem, was der Verein über sie festgehalten hat, unwiderruflich löschen, auch wenn noch etwas läuft.',
  },
  [PERMISSION_KEYS.groupsManage]: {
    title: 'Gruppen verwalten',
    line: 'Gruppen anlegen, bearbeiten und archivieren; alle Zugehörigkeiten und Gruppen-Admins verwalten.',
  },
  [PERMISSION_KEYS.rolesManage]: {
    title: 'Rollen und Rechte verwalten',
    line: 'Rollen anlegen, Rechte ändern und Inhaberschaften eintragen. Schließt faktisch alle anderen Rechte ein.',
  },
  [PERMISSION_KEYS.clubRead]: {
    title: 'Den Verein sehen',
    line: 'Ergibt sich aus einer bestehenden Mitgliedschaft, nicht aus einer Rolle.',
  },
  [PERMISSION_KEYS.announcementsPost]: {
    title: 'Aushänge schreiben',
    line: 'Aushänge veröffentlichen, bearbeiten und abnehmen, auch die anderer.',
  },
  [PERMISSION_KEYS.clubManage]: {
    title: 'Vereinsdaten, Sessionseinträge und Orte pflegen',
    line: 'Vereinsdaten ändern; Sessionseinträge pflegen; Orte anlegen, bearbeiten und archivieren.',
  },
  [PERMISSION_KEYS.keyHoldingsManage]: {
    title: 'Schlüssel führen',
    line: 'Physische Schlüssel für Orte ausgeben und zurücknehmen.',
  },
  [PERMISSION_KEYS.boardManage]: {
    title: 'Vorstand führen',
    line: 'Vorstandsfunktionen anlegen und archivieren, Sitze besetzen und beenden. Die verknüpfte Rolle ist davon ausgenommen.',
  },
  [PERMISSION_KEYS.calendarManageClub]: {
    title: 'Vereinstermine führen',
    line: 'Termine des Vereins anlegen, ändern und löschen, nicht die der Gruppen.',
  },
  [PERMISSION_KEYS.accountsManage]: {
    title: 'Zugänge wiederherstellen und sperren',
    line: 'Zugänge vor Ort wiederherstellen, sperren und entsperren; Personen ohne Geburtsdatum einladen und für ihr Alter bürgen. Kommt einer Übernahme jedes Zugangs gleich.',
  },
  [PERMISSION_KEYS.membershipApplicationsDecide]: {
    title: 'Über Beitrittsanträge entscheiden',
    line: 'Beitrittsanträge sehen, bei jedem neuen eine Mail bekommen, aufnehmen oder ablehnen. Eine Aufnahme legt Person, Mitgliedschaft und Einladung an, auch ohne das Recht, Personen zu pflegen.',
  },
};

const KNOWN_KEYS: readonly PermissionKey[] = Object.values(PERMISSION_KEYS);

export const isPermissionKey = (value: string): value is PermissionKey =>
  KNOWN_KEYS.some((known) => known === value);

export const toPermissionCopy = (key: PermissionKey): RolePermissionCopy => PERMISSION_COPY[key];
