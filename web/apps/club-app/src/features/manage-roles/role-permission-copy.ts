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
};

const KNOWN_KEYS: readonly PermissionKey[] = Object.values(PERMISSION_KEYS);

export const isPermissionKey = (value: string): value is PermissionKey =>
  KNOWN_KEYS.some((known) => known === value);

export const toPermissionCopy = (key: PermissionKey): RolePermissionCopy => PERMISSION_COPY[key];
