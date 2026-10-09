import { countLabel } from '../gallery-view';
import type { UploadFailure } from './upload-queue';
import type { UploadStatus } from './upload-status';

export const DROP_LEAD = 'Ordner hierher ziehen';
export const DROP_ACTIVE_LEAD = 'Loslassen — der Abend entwickelt sich';
export const DROP_META = 'JPEG · HEIC · PNG · WebP · MP4 · MOV — Originale bleiben unverändert';
export const PICK_FILES_LABEL = 'Dateien wählen';
export const PICK_FOLDER_LABEL = 'Ordner wählen';
export const RETRY_ALL_LABEL = 'Wiederholen';
export const CANCEL_ALL_LABEL = 'Abbrechen';
export const CLEAR_LABEL = 'Fertige ausblenden';
export const INBOX_TARGET = 'Eingang';
export const EMPTY_COUNTER = '0 / 0';

const FAILURE_LINES: Record<UploadFailure, string> = {
  tooLarge: 'zu groß',
  notAccepted: 'kein Foto oder Video',
  notAllowed: 'nicht erlaubt',
  albumGone: 'Album gibt es nicht mehr',
  interrupted: 'abgebrochen — antippen zum Wiederholen',
};

export const failureLineOf = (failure: UploadFailure | null): string =>
  failure === null ? '' : FAILURE_LINES[failure];

export const counterOf = (status: UploadStatus): string =>
  status.kind === 'empty'
    ? EMPTY_COUNTER
    : `${countLabel(status.sent)} / ${countLabel(status.total)}`;

const minutesPart = (minutes: number | null): string =>
  minutes === null ? 'misst Tempo …' : `noch ca. ${countLabel(minutes)} min`;

const failedPart = (failed: number): string[] =>
  failed === 0 ? [] : [`${countLabel(failed)} fehlgeschlagen`];

export const statusLineOf = (status: UploadStatus, failed: number, target: string): string => {
  switch (status.kind) {
    case 'empty':
      return `Ziel: ${target}`;
    case 'paused':
      return ['Pausiert · setzt fort, sobald Netz da ist', ...failedPart(failed)].join(' · ');
    case 'running':
      return [
        minutesPart(status.minutes),
        `${countLabel(status.streams)} parallel`,
        ...failedPart(failed),
        `Ziel: ${target}`,
      ].join(' · ');
    case 'finished':
      return [`Alles hochgeladen`, ...failedPart(failed), `Ziel: ${target}`].join(' · ');
  }
};

export const threadLabelOf = (status: UploadStatus): string =>
  status.kind === 'empty'
    ? ''
    : `Hochladen: ${countLabel(status.sent)} von ${countLabel(status.total)}`;

export const tileLabelOf = (name: string, clock: string, failure: UploadFailure | null): string =>
  [name, clock, failureLineOf(failure)].filter((part) => part !== '').join(', ');

export const sceneMetaOf = (count: number, developed: number): string =>
  `${countLabel(count)} ${count === 1 ? 'Bild' : 'Bilder'} · ${countLabel(developed)} entwickelt`;
