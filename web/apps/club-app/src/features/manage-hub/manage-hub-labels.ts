import type { KkIconName } from '@furria/ui';
import type { ManageBankId, ManagePanelDefinition, ManagePanelId } from './manage-hub-panels';
import { MANAGE_BANKS, MANAGE_PANELS } from './manage-hub-panels';
import type { ManageHub } from './schemas';

export const MANAGE_TITLE = 'Verein verwalten';
export const MANAGE_LEAD = 'Personen, Gruppen, Ämter und Schlüssel des Vereins zentral pflegen.';
export const MANAGE_LOADING_LABEL = 'Die Verwaltung wird geladen';
export const MANAGE_EMPTY_NOTE =
  'Noch ist nichts eingetragen. Alles, was Verein und Kalender zeigen, steht ab hier.';
export const MANAGE_ERROR_TITLE = 'VERWALTUNG NICHT GELADEN';
export const MANAGE_RETRY_LABEL = 'Erneut laden';

const EMPTY_STATUS = 'Noch leer';
const ALL_RETURNED = 'Alle zurück';
const SUMMARY_SEPARATOR = ' · ';

export type ManageRowStatusTone = 'gold' | 'neutral';

export interface ManageRowStatus {
  label: string;
  tone: ManageRowStatusTone;
}

export interface ManageRowModel {
  id: ManagePanelId;
  bank: ManageBankId;
  title: string;
  icon: KkIconName;
  to: string;
  isEmpty: boolean;
  summary: string | undefined;
  status: ManageRowStatus | undefined;
}

export interface ManageBankModel {
  id: ManageBankId;
  title: string;
  rows: readonly ManageRowModel[];
}

interface ManageRowFacts {
  isEmpty: boolean;
  summaryParts: readonly string[];
  attention: string | null;
}

interface ManageFactSource {
  hub: ManageHub;
  sessionLabel: string;
}

type ManageFactReader = (source: ManageFactSource) => ManageRowFacts | null;

const toCount = (count: number, singular: string, plural: string): string =>
  `${count} ${count === 1 ? singular : plural}`;

const toArchivedParts = (archivedCount: number): string[] =>
  archivedCount > 0 ? [`${archivedCount} archiviert`] : [];

const toVacancy = (vacantCount: number): string | null =>
  vacantCount > 0 ? `${vacantCount} unbesetzt` : null;

const toKeyParts = (holdingCount: number, holderCount: number): string[] =>
  holdingCount > 0
    ? [`${holdingCount} ausgegeben`, `bei ${toCount(holderCount, 'Person', 'Personen')}`]
    : [ALL_RETURNED];

const PANEL_FACTS: Record<ManagePanelId, ManageFactReader> = {
  persons: ({ hub }) =>
    hub.persons === null
      ? null
      : {
          isEmpty: hub.persons.personCount === 0,
          summaryParts: [
            toCount(hub.persons.personCount, 'Person', 'Personen'),
            toCount(hub.persons.memberCount, 'Mitglied', 'Mitglieder'),
          ],
          attention: null,
        },
  groups: ({ hub }) =>
    hub.groups === null
      ? null
      : {
          isEmpty: hub.groups.groupCount + hub.groups.archivedCount === 0,
          summaryParts: [
            toCount(hub.groups.groupCount, 'Gruppe', 'Gruppen'),
            ...toArchivedParts(hub.groups.archivedCount),
          ],
          attention: null,
        },
  roles: ({ hub }) =>
    hub.roles === null
      ? null
      : {
          isEmpty: hub.roles.roleCount === 0,
          summaryParts: [toCount(hub.roles.roleCount, 'Rolle', 'Rollen')],
          attention: toVacancy(hub.roles.vacantCount),
        },
  board: ({ hub }) =>
    hub.board === null
      ? null
      : {
          isEmpty: hub.board.officeCount === 0,
          summaryParts: [
            toCount(hub.board.officeCount, 'Funktion', 'Funktionen'),
            toCount(hub.board.seatCount, 'Sitz besetzt', 'Sitze besetzt'),
          ],
          attention: toVacancy(hub.board.vacantOfficeCount),
        },
  sessions: ({ hub, sessionLabel }) =>
    hub.sessions === null
      ? null
      : {
          isEmpty: hub.sessions.entryCount === 0,
          summaryParts: [toCount(hub.sessions.entryCount, 'Eintrag', 'Einträge')],
          attention: hub.sessions.hasCurrentEntry ? null : `${sessionLabel} fehlt`,
        },
  venues: ({ hub }) =>
    hub.venues === null
      ? null
      : {
          isEmpty: hub.venues.venueCount + hub.venues.archivedCount === 0,
          summaryParts: [
            toCount(hub.venues.venueCount, 'Ort', 'Orte'),
            ...toArchivedParts(hub.venues.archivedCount),
          ],
          attention: null,
        },
  keys: ({ hub }) =>
    hub.keys === null
      ? null
      : {
          isEmpty: hub.keys.issuedCount === 0,
          summaryParts: toKeyParts(hub.keys.holdingCount, hub.keys.holderCount),
          attention: null,
        },
};

const toStatus = (facts: ManageRowFacts): ManageRowStatus | undefined => {
  if (facts.isEmpty) {
    return { label: EMPTY_STATUS, tone: 'neutral' };
  }
  if (facts.attention !== null) {
    return { label: facts.attention, tone: 'gold' };
  }

  return undefined;
};

const toRow = (panel: ManagePanelDefinition, facts: ManageRowFacts): ManageRowModel => ({
  id: panel.id,
  bank: panel.bank,
  title: panel.title,
  icon: panel.icon,
  to: panel.to,
  isEmpty: facts.isEmpty,
  summary: facts.isEmpty ? undefined : facts.summaryParts.join(SUMMARY_SEPARATOR),
  status: toStatus(facts),
});

export const toManageRows = (hub: ManageHub, sessionLabel: string): ManageRowModel[] => {
  const source: ManageFactSource = { hub, sessionLabel };

  return MANAGE_PANELS.flatMap((panel) => {
    const facts = PANEL_FACTS[panel.id](source);

    if (facts === null) {
      return [];
    }

    return [toRow(panel, facts)];
  });
};

export const toManageBanks = (rows: readonly ManageRowModel[]): ManageBankModel[] =>
  MANAGE_BANKS.flatMap((bank) => {
    const bankRows = rows.filter((row) => row.bank === bank.id);

    if (bankRows.length === 0) {
      return [];
    }

    return [{ id: bank.id, title: bank.title, rows: bankRows }];
  });

export const isBoardEmpty = (rows: readonly ManageRowModel[]): boolean =>
  rows.length > 0 && rows.every((row) => row.isEmpty);
