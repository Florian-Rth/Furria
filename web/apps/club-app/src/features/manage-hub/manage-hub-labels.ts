import type { KkIconName } from '@furria/ui';
import type { ManageBankId, ManagePanelDefinition, ManagePanelId } from './manage-hub-panels';
import { MANAGE_BANKS, MANAGE_PANELS } from './manage-hub-panels';
import type { ManageHub } from './schemas';

export const MANAGE_TITLE = 'Verein verwalten';
export const MANAGE_EYEBROW = 'VERWALTUNG';
export const MANAGE_LEAD =
  'Hier hält der Verein seinen Bestand — wer dazugehört, was er führt, wer wofür einen Schlüssel hat. Geändert wird er nur hier; Verein und Kalender lesen ihn.';
export const MANAGE_LOADING_LABEL = 'Die Verwaltung wird geladen';
export const MANAGE_EMPTY_NOTE =
  'Noch ist nichts eingetragen. Alles, was Verein und Kalender zeigen, steht ab hier.';
export const MANAGE_ERROR_TITLE = 'VERWALTUNG NICHT GELADEN';
export const MANAGE_RETRY_LABEL = 'Erneut laden';

const EMPTY_COUNT = '—';
const ALL_SEATS_TAKEN = 'Alle besetzt';

export interface ManageTileModel {
  id: ManagePanelId;
  bank: ManageBankId;
  title: string;
  icon: KkIconName;
  to: string;
  countLabel: string;
  isEmpty: boolean;
  footLine: string;
  vacancyLabel: string | null;
}

export interface ManageBankTile {
  tile: ManageTileModel;
  isWide: boolean;
}

export interface ManageBankModel {
  id: ManageBankId;
  title: string;
  tiles: readonly ManageBankTile[];
}

interface ManageTileFacts {
  primaryCount: number;
  fullLine: string;
  emptyLine: string;
  vacancyCount: number | null;
}

interface ManageFactSource {
  hub: ManageHub;
  sessionLabel: string;
}

type ManageFactReader = (source: ManageFactSource) => ManageTileFacts | null;

const toMemberLine = (memberCount: number): string => {
  if (memberCount > 1) {
    return `${memberCount} Mitglieder`;
  }
  if (memberCount === 1) {
    return '1 Mitglied';
  }

  return 'Keine Mitgliedschaft';
};

const toArchivedLine = (archivedCount: number): string => {
  if (archivedCount > 1) {
    return `${archivedCount} archiviert`;
  }
  if (archivedCount === 1) {
    return '1 archiviert';
  }

  return 'Keine archiviert';
};

const toHolderLine = (holderCount: number): string => {
  if (holderCount > 1) {
    return `bei ${holderCount} Personen`;
  }
  if (holderCount === 1) {
    return 'bei 1 Person';
  }

  return 'bei niemandem';
};

const toSessionLine = (sessionLabel: string, hasCurrentEntry: boolean): string =>
  hasCurrentEntry ? `${sessionLabel} eingetragen` : `${sessionLabel} fehlt noch`;

const PANEL_FACTS: Record<ManagePanelId, ManageFactReader> = {
  persons: ({ hub }) =>
    hub.persons === null
      ? null
      : {
          primaryCount: hub.persons.personCount,
          fullLine: toMemberLine(hub.persons.memberCount),
          emptyLine: 'Die erste Person',
          vacancyCount: null,
        },
  groups: ({ hub }) =>
    hub.groups === null
      ? null
      : {
          primaryCount: hub.groups.groupCount,
          fullLine: toArchivedLine(hub.groups.archivedCount),
          emptyLine: 'Die erste Gruppe',
          vacancyCount: null,
        },
  roles: ({ hub }) =>
    hub.roles === null
      ? null
      : {
          primaryCount: hub.roles.roleCount,
          fullLine: ALL_SEATS_TAKEN,
          emptyLine: 'Die erste Rolle',
          vacancyCount: hub.roles.vacantCount,
        },
  board: ({ hub }) =>
    hub.board === null
      ? null
      : {
          primaryCount: hub.board.seatCount,
          fullLine: ALL_SEATS_TAKEN,
          emptyLine: 'Die erste Funktion',
          vacancyCount: hub.board.vacantOfficeCount,
        },
  sessions: ({ hub, sessionLabel }) =>
    hub.sessions === null
      ? null
      : {
          primaryCount: hub.sessions.entryCount,
          fullLine: toSessionLine(sessionLabel, hub.sessions.hasCurrentEntry),
          emptyLine: 'Der erste Eintrag',
          vacancyCount: null,
        },
  venues: ({ hub }) =>
    hub.venues === null
      ? null
      : {
          primaryCount: hub.venues.venueCount,
          fullLine: toArchivedLine(hub.venues.archivedCount),
          emptyLine: 'Der erste Ort',
          vacancyCount: null,
        },
  keys: ({ hub }) =>
    hub.keys === null
      ? null
      : {
          primaryCount: hub.keys.holdingCount,
          fullLine: toHolderLine(hub.keys.holderCount),
          emptyLine: 'Der erste Schlüssel',
          vacancyCount: null,
        },
};

const toTile = (panel: ManagePanelDefinition, facts: ManageTileFacts): ManageTileModel => {
  const isEmpty = facts.primaryCount === 0;
  const vacancyCount = facts.vacancyCount;
  const vacancyLabel =
    isEmpty || vacancyCount === null || vacancyCount === 0 ? null : `${vacancyCount} unbesetzt`;

  return {
    id: panel.id,
    bank: panel.bank,
    title: panel.title,
    icon: panel.icon,
    to: panel.to,
    countLabel: isEmpty ? EMPTY_COUNT : String(facts.primaryCount),
    isEmpty,
    footLine: isEmpty ? facts.emptyLine : facts.fullLine,
    vacancyLabel,
  };
};

export const toManageTiles = (hub: ManageHub, sessionLabel: string): ManageTileModel[] => {
  const source: ManageFactSource = { hub, sessionLabel };

  return MANAGE_PANELS.flatMap((panel) => {
    const facts = PANEL_FACTS[panel.id](source);

    if (facts === null) {
      return [];
    }

    return [toTile(panel, facts)];
  });
};

export const toManageBanks = (tiles: readonly ManageTileModel[]): ManageBankModel[] =>
  MANAGE_BANKS.flatMap((bank) => {
    const bankTiles = tiles.filter((tile) => tile.bank === bank.id);

    if (bankTiles.length === 0) {
      return [];
    }

    const lastIndex = bankTiles.length - 1;
    const endsOdd = bankTiles.length % 2 === 1;

    return [
      {
        id: bank.id,
        title: bank.title,
        tiles: bankTiles.map((tile, index) => ({ tile, isWide: endsOdd && index === lastIndex })),
      },
    ];
  });

export const isBoardEmpty = (tiles: readonly ManageTileModel[]): boolean =>
  tiles.length > 0 && tiles.every((tile) => tile.isEmpty);
