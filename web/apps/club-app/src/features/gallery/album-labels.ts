import type { KkFilterOption, KkLoupeLabels } from '@furria/ui';
import { countLabel, dayLabel, personNameOf, sessionLabel } from './gallery-view';
import type { AlbumDetails, AlbumItem } from './schemas';

export const ALL_FILTER = 'all';

export const ZIP_LABEL = 'ZIP';
export const SELECT_LABEL = 'Auswählen';
export const SELECT_DONE_LABEL = 'Fertig';
export const UPLOAD_HERE_LABEL = 'Hochladen';
export const EDIT_LABEL = 'Bearbeiten';
export const SELECTION_EDIT_LABEL = 'Auswahl bearbeiten';
export const RAIL_LABEL = 'Zeitleiste des Abends';
export const KIND_FILTER_LABEL = 'Art';
export const UPLOADER_FILTER_LABEL = 'Fotograf';
export const NO_DATE_LABEL = 'Ohne Datum';
export const MOVE_LABEL = 'Verschieben';
export const DELETE_LABEL = 'Löschen';
export const ADD_TO_SELECTION_LABEL = 'In Auswahl';
export const REMOVE_FROM_SELECTION_LABEL = 'Aus Auswahl';
export const UNDO_LABEL = 'Rückgängig';
export const OPEN_LABEL = 'Öffnen';
export const MOVE_SHEET_ID = 'album-move';
export const MOVE_SHEET_TITLE = 'Verschieben nach';
export const SHEET_CLOSE_LABEL = 'Schließen';
export const BULK_LABEL = 'Ausgewählte Bilder';
export const PUBLISHED_MARK = 'Auf der Website';
export const UNPUBLISHED_MARK = 'Nicht veröffentlicht';
export const NO_SESSION_NOTE = 'Ohne Session nicht veröffentlichbar';
export const EMPTY_TITLE = 'Noch keine Bilder';
export const EMPTY_DESCRIPTION =
  'Sobald jemand Fotos oder Videos hineinlegt, entwickelt sich hier der Abend.';
export const FILTERED_EMPTY_TITLE = 'Nichts in diesem Filter';
export const FILTERED_EMPTY_DESCRIPTION = 'Für diese Auswahl gibt es in diesem Album keine Bilder.';
export const NOT_FOUND_TITLE = 'Album nicht gefunden';
export const NOT_FOUND_DESCRIPTION = 'Es wurde gelöscht oder hat nie existiert.';
export const FAILED_TITLE = 'Album lädt nicht';
export const FAILED_DESCRIPTION = 'Die Verbindung hat nicht geklappt.';
export const RETRY_LABEL = 'Nochmal';
export const WRITE_FAILED = 'Das hat nicht geklappt. Bitte nochmal versuchen.';

export const LOUPE_LABELS: KkLoupeLabels = {
  dialog: 'Bildansicht',
  close: 'Schließen',
  download: 'Original',
  previousScene: 'Vorige Szene',
  nextScene: 'Nächste Szene',
  play: 'Video abspielen',
  developing: 'Entwickelt sich',
};

const WEEKDAY_DATE = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const albumDateLine = (album: AlbumDetails): string =>
  album.calendarEntry === null
    ? NO_DATE_LABEL
    : WEEKDAY_DATE.format(new Date(album.calendarEntry.startsAt));

export const photographersLine = (album: AlbumDetails): string | null => {
  const names = album.uploaders.flatMap((entry) =>
    entry.uploader === null ? [] : [personNameOf(entry.uploader)],
  );
  return names.length === 0 ? null : `Fotos: ${names.join(', ')}`;
};

export const albumMetaLine = (album: AlbumDetails): string => {
  const parts = [
    album.sessionStartYear === null ? null : `Session ${sessionLabel(album.sessionStartYear)}`,
    photographersLine(album),
  ].filter((part) => part !== null);
  return parts.join(' · ');
};

export const scenesTrail = (count: number): string =>
  count === 1 ? '1 Szene' : `${countLabel(count)} Szenen`;

export const frameCaption = (number: number, clock: string): string =>
  clock === '' ? `Bild ${number}` : `Bild ${number}, ${clock}`;

export const sceneLabel = (index: number, span: string): string => `Szene ${index}, ${span}`;

export const sceneMeta = (count: number): string =>
  count === 1 ? '1 Bild' : `${countLabel(count)} Bilder`;

export const loupeSceneLine = (index: number, total: number): string =>
  `Szene ${index} von ${countLabel(total)}`;

const CAPTURE_DATE = new Intl.DateTimeFormat('de-DE', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export const loupeFacts = (item: AlbumItem): string =>
  [
    item.camera,
    item.uploader === null
      ? null
      : `${item.kind === 'video' ? 'Video' : 'Foto'}: ${personNameOf(item.uploader)}`,
    item.capturedAt === null ? null : CAPTURE_DATE.format(new Date(item.capturedAt)),
    item.width === null || item.height === null ? null : `${item.width} × ${item.height}`,
  ]
    .filter((part) => part !== null)
    .join(' · ');

export const loupeAlt = (albumTitle: string, number: number): string =>
  `${albumTitle}, Bild ${number}`;

export const kindOptionsOf = (album: AlbumDetails): KkFilterOption[] => [
  { id: ALL_FILTER, label: 'Alle', count: album.photos + album.videos },
  { id: 'photo', label: 'Fotos', count: album.photos },
  { id: 'video', label: 'Videos', count: album.videos },
];

export const uploaderOptionsOf = (album: AlbumDetails): KkFilterOption[] => {
  const people = album.uploaders.flatMap((entry) =>
    entry.uploader === null
      ? []
      : [
          {
            id: String(entry.uploader.personId),
            label: entry.uploader.firstName,
            count: entry.count,
          },
        ],
  );
  const total = album.uploaders.reduce((sum, entry) => sum + entry.count, 0);
  return [{ id: ALL_FILTER, label: 'Alle', count: total }, ...people];
};

export const selectionLead = (count: number): string => `Auswahl · ${count}`;

export const selectionState = (album: AlbumDetails): string => {
  if (album.sessionStartYear === null) {
    return NO_SESSION_NOTE;
  }
  return album.publishedAt === null
    ? UNPUBLISHED_MARK
    : `${PUBLISHED_MARK} seit ${dayLabel(album.publishedAt) ?? ''}`;
};

export const bulkCountLine = (count: number): string =>
  count === 1 ? '1 Bild' : `${countLabel(count)} Bilder`;

export const movedMessage = (count: number, title: string): string =>
  `${bulkCountLine(count)} nach „${title}" verschoben`;

export const binnedMessage = (count: number): string => `${bulkCountLine(count)} im Papierkorb`;

export const restoredMessage = (count: number): string => `${bulkCountLine(count)} zurückgeholt`;

export const selectionChangedMessage = (count: number): string =>
  `Auswahl hat jetzt ${bulkCountLine(count)}`;

export const moveTargetMeta = (sessionStartYear: number | null, items: number): string =>
  sessionStartYear === null
    ? bulkCountLine(items)
    : `Session ${sessionLabel(sessionStartYear)} · ${bulkCountLine(items)}`;

export const SELECTION_EMPTY_NOTE =
  'Noch keine Fotos ausgewählt. Bilder auswählen und „In Auswahl" tippen.';

export const selectionFrameLabel = (order: number, title: string): string =>
  `Auswahl ${order}, ${title}`;
