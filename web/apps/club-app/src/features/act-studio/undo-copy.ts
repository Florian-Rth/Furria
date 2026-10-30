import type { ChoreographyVersion } from './schemas';
import type { OverlapRow } from './studio-conflict';
import { fineClockOf } from './studio-copy';
import type { StudioWriteKind } from './studio-undo';

export const UNDO_LABEL = 'Rückgängig';
export const REDO_LABEL = 'Wiederholen';
export const UNDO_GROUP = 'act-studio-undo';
export const UNDONE_PREFIX = 'Rückgängig gemacht';
export const REDONE_PREFIX = 'Wiederholt';

export const WRITE_TEXT: Record<StudioWriteKind, string> = {
  songAdd: 'Lied hinzugefügt',
  songRemove: 'Lied entfernt',
  songRestore: 'Lied zurückgeholt',
  songOrder: 'Reihenfolge der Lieder geändert',
  songSettings: 'Musikschnitt geändert',
  finalAdd: 'Endfassung hochgeladen',
  finalRemove: 'Endfassung entfernt',
  finalRestore: 'Endfassung zurückgeholt',
  finalBeat: 'Takt der Endfassung geändert',
  finalOffsets: 'Endfassung verschoben',
  finalMatch: 'Endfassung angelegt',
  finalAdopt: 'Endfassung übernommen',
  stepsMark: 'Schritt gesetzt',
  stepsRemove: 'Schritt entfernt',
  stepsRestore: 'Schritt zurückgeholt',
  stepText: 'Schritt beschrieben',
  stepStart: 'Schritt verschoben',
  partAdd: 'Teil angelegt',
  partRemove: 'Teil aufgelöst',
  partRestore: 'Teil zurückgeholt',
  partSettings: 'Teil geändert',
  videoAdd: 'Video hinzugefügt',
  videoRemove: 'Video entfernt',
  videoRestore: 'Video zurückgeholt',
  videoName: 'Video umbenannt',
  videoStart: 'Video verschoben',
  videoAlign: 'Video angelegt',
  spotAdd: 'Platz hinzugefügt',
  spotRemove: 'Platz entfernt',
  spotRestore: 'Platz zurückgeholt',
  spotAssign: 'Platz besetzt',
  tracks: 'Aufstellung geändert',
  restore: 'Ältere Fassung wiederhergestellt',
  eveningJoin: 'Beim Abend dabei',
  eveningLeave: 'Abend verlassen',
  eveningDancer: 'Besetzung des Abends geändert',
  eveningSpot: 'Platz des Abends besetzt',
  eveningTracks: 'Aufstellung des Abends geändert',
  eveningCopyDrop: 'Eigene Aufstellung des Abends verworfen',
  batch: 'Mehrere Änderungen',
};

export const undoneTextOf = (kind: StudioWriteKind): string =>
  `${UNDONE_PREFIX}: ${WRITE_TEXT[kind]}`;

export const redoneTextOf = (kind: StudioWriteKind): string =>
  `${REDONE_PREFIX}: ${WRITE_TEXT[kind]}`;

export const HISTORY_TITLE = 'Verlauf';
export const HISTORY_VISIT = 'Deine Änderungen bei diesem Besuch';
export const HISTORY_EMPTY = 'Noch nichts geändert.';
export const HISTORY_YOU = 'Du';
export const HISTORY_UNDONE = 'zurückgenommen';
export const HISTORY_FIXED = 'nicht umkehrbar';
export const UNDO_ARIA = 'Rückgängig (Strg+Z)';
export const REDO_ARIA = 'Wiederholen (Strg+Umschalt+Z)';

export const VERSIONS_TITLE = 'Fassungen der Aufstellung';
export const EVENING_VERSIONS_TITLE = 'Fassungen dieses Abends';
export const VERSIONS_NOTE =
  'Jede Speicherung bleibt erhalten. Wiederherstellen legt eine neue Fassung an.';
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

export const visitMetaOf = (at: string, eveningTitle: string | null): string => {
  const when = CLOCK.format(new Date(at));

  return eveningTitle === null
    ? `${HISTORY_YOU} · ${when}`
    : `${HISTORY_YOU} · ${when} · ${eveningTitle}`;
};

export const MERGE_KEEP_MINE = 'Meine Fassung behalten';
export const MERGE_TAKE_THEIRS = 'Andere übernehmen';
const UNKNOWN_SPOT = 'Entfernter Platz';
const UNPLACED_KEYS = 'außerhalb der Musik';

export const overlapLineOf = (row: OverlapRow): string => {
  const spot = row.spotNumber === null ? UNKNOWN_SPOT : `Platz ${row.spotNumber}`;
  const times = row.seconds.map(fineClockOf);
  const outside = row.unplaced > 0 ? [`${row.unplaced} ${UNPLACED_KEYS}`] : [];

  return `${spot}: ${[...times, ...outside].join(' · ')}`;
};
