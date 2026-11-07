import type { ChangeKind } from '@furria/studio/edit-history';
import type { ChoreographyVersion } from './schemas';

export const UNDO_LABEL = 'Rückgängig';
export const REDO_LABEL = 'Wiederholen';

export const CHANGE_TEXT: Record<ChangeKind, string> = {
  songOrder: 'Liedfolge geändert',
  songSettings: 'Lied eingestellt',
  finalBeat: 'Takt der Endfassung gesetzt',
  finalOffset: 'Endfassung ausgerichtet',
  stepMark: 'Schritt gesetzt',
  stepMove: 'Schrittgrenze verschoben',
  stepName: 'Schritt umbenannt',
  stepRemove: 'Schritt entfernt',
  partAdd: 'Teil angelegt',
  partSettings: 'Teil geändert',
  partRemove: 'Teil entfernt',
  videoName: 'Video benannt',
  videoStart: 'Video verschoben',
  videoClip: 'Video geschnitten',
  spotAdd: 'Platz hinzugefügt',
  spotRemove: 'Platz entfernt',
  spotAssign: 'Platz besetzt',
  tracks: 'Aufstellung geändert',
};

export const HISTORY_TITLE = 'Verlauf';
export const HISTORY_EMPTY = 'Noch nichts geändert.';
export const HISTORY_YOU = 'Du';
export const HISTORY_UNDONE = 'zurückgenommen';
export const UNDO_ARIA = 'Rückgängig (Strg+Z)';
export const REDO_ARIA = 'Wiederholen (Strg+Umschalt+Z)';

export const VERSIONS_TITLE = 'Fassungen der Aufstellung';
export const EVENING_VERSIONS_TITLE = 'Fassungen dieses Abends';
export const VERSIONS_OLDER = 'Ältere Fassungen laden';
export const VERSIONS_OLDER_RETRY = 'Ältere Fassungen erneut laden';
export const VERSIONS_OLDER_FAILED = 'Ältere Fassungen konnten nicht geladen werden.';
export const VERSIONS_EMPTY = 'Noch keine Fassung gespeichert.';
export const VERSIONS_FAILED = 'Die Fassungen konnten nicht geladen werden.';
export const VERSION_RESTORE = 'Wiederherstellen';
export const VERSION_CURRENT = 'aktuell';
const UNKNOWN_AUTHOR = 'Unbekannt';

const VERSION_KIND_TEXT: Record<ChoreographyVersion['kind'], string> = {
  saved: 'Gespeichert',
  restored: 'Wiederhergestellt',
  spotRemoved: 'Platz entfernt',
  musicAdopted: 'Endfassung übernommen',
};

const STAMP = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});
const CLOCK = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' });

export const versionLabelOf = (version: ChoreographyVersion): string => {
  const kind = VERSION_KIND_TEXT[version.kind];

  return version.restoredFromVersion === null
    ? `Fassung ${version.version} · ${kind}`
    : `Fassung ${version.version} · ${kind} aus Fassung ${version.restoredFromVersion}`;
};

export const versionMetaOf = (version: ChoreographyVersion): string => {
  const author =
    version.savedBy === null
      ? UNKNOWN_AUTHOR
      : `${version.savedBy.firstName} ${version.savedBy.lastName}`;

  return `${author} · ${STAMP.format(new Date(version.savedAt))}`;
};

export const restoreLabelOf = (version: ChoreographyVersion): string =>
  `${VERSION_RESTORE}: Fassung ${version.version}`;

export const visitMetaOf = (at: number, eveningTitle: string | null): string => {
  const when = CLOCK.format(new Date(at));

  return eveningTitle === null
    ? `${HISTORY_YOU} · ${when}`
    : `${HISTORY_YOU} · ${when} · ${eveningTitle}`;
};
