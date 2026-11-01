import type { DownloadFailure, SavedMediaKind, SaveRoute } from './media-download';
import { byteSizeLabel } from './media-download';

export const DOWNLOAD_STOP_ACTION = 'Abbrechen';
export const DOWNLOAD_SAVE_ACTION = 'Sichern';
export const DOWNLOAD_SAVE_AGAIN_ACTION = 'Erneut sichern';
export const DOWNLOAD_RETRY_ACTION = 'Erneut';
export const DOWNLOAD_DISMISS_ACTION = 'Schließen';

const TARGETS: Record<SaveRoute, string> = {
  share: 'Teilen-Menü → „In Dateien sichern“',
  download: 'Downloads',
};

const FAILURES: Record<DownloadFailure, string> = {
  interrupted: 'Verbindung abgerissen',
  noSpace: 'Kein Platz mehr auf dem Gerät',
  expired: 'Download-Link abgelaufen',
  gone: 'Album nicht mehr da',
  unexpected: 'Download fehlgeschlagen',
};

const KIND_LABELS: Record<SavedMediaKind, string> = { album: 'ZIP', original: 'Original' };

const STARTING: Record<SavedMediaKind, string> = {
  album: 'wird gepackt …',
  original: 'wird geladen …',
};

export const DOWNLOAD_BUSY_LINE = 'Warte, bis der laufende Download fertig ist';

export const saveTargetLabel = (route: SaveRoute): string => TARGETS[route];

export const downloadReplacesLine = (title: string): string =>
  `Der laufende Download „${title}“ wird dafür abgebrochen.`;

export const downloadRunningLine = (
  kind: SavedMediaKind,
  title: string,
  received: number,
  expected: number,
): string => {
  const head = `${KIND_LABELS[kind]} „${title}“`;
  if (received === 0) {
    return `${head} ${STARTING[kind]}`;
  }
  return expected > 0
    ? `${head} · ${byteSizeLabel(received)} / ${byteSizeLabel(expected)}`
    : `${head} · ${byteSizeLabel(received)}`;
};

export const downloadReadyLine = (
  kind: SavedMediaKind,
  title: string,
  route: SaveRoute,
  bytes: number,
): string =>
  route === 'share'
    ? `${KIND_LABELS[kind]} „${title}“ ist fertig · ${byteSizeLabel(bytes)}`
    : `${KIND_LABELS[kind]} „${title}“ liegt in den Downloads`;

export const downloadFailedLine = (
  kind: SavedMediaKind,
  title: string,
  failure: DownloadFailure,
): string => `${KIND_LABELS[kind]} „${title}“ · ${FAILURES[failure]}`;
