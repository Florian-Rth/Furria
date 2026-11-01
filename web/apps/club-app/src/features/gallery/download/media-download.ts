export type DownloadFailure = 'interrupted' | 'noSpace' | 'expired' | 'gone' | 'unexpected';

export type SaveRoute = 'share' | 'download';

export type SavedMediaKind = 'album' | 'original';

export interface DownloadRequest {
  kind: SavedMediaKind;
  title: string;
  fileName: string;
  expectedBytes: number;
  url: string;
  refreshUrl: () => Promise<string>;
}

interface DownloadJobBase {
  key: number;
  request: DownloadRequest;
  expectedBytes: number;
  receivedBytes: number;
}

export type DownloadJob =
  | (DownloadJobBase & { phase: 'running' })
  | (DownloadJobBase & { phase: 'ready'; file: File; route: SaveRoute })
  | (DownloadJobBase & { phase: 'failed'; failure: DownloadFailure });

export interface SaveTraits {
  system: 'ios' | 'android' | 'other';
  sharesFile: boolean;
}

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
const UNIT_STEP = 1000;
const WHOLE_FROM = 100;
const ZIP_EXTENSION = '.zip';
const FILE_NAME_STAND_IN = '_';
const FORBIDDEN_IN_FILE_NAME = /[\\/:*?"<>|\p{Cc}]/gu;
const FALLBACK_FILE_NAME = 'Album';
const ONE_DECIMAL = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 });
const WHOLE = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });

const FAILURE_BY_STATUS: Record<number, DownloadFailure> = { 403: 'expired', 404: 'gone' };

export const byteSizeLabel = (bytes: number): string => {
  let value = Math.max(bytes, 0);
  let unit = 0;
  while (value >= UNIT_STEP && unit < BYTE_UNITS.length - 1) {
    value /= UNIT_STEP;
    unit += 1;
  }
  const format = unit === 0 || value >= WHOLE_FROM ? WHOLE : ONE_DECIMAL;
  return `${format.format(value)} ${BYTE_UNITS[unit]}`;
};

export const downloadFractionOf = (receivedBytes: number, expectedBytes: number): number | null => {
  if (receivedBytes <= 0 || expectedBytes <= 0) {
    return null;
  }
  return Math.min(receivedBytes / expectedBytes, 1);
};

export const zipFileNameOf = (title: string): string => {
  const cleaned = title.replace(FORBIDDEN_IN_FILE_NAME, FILE_NAME_STAND_IN).trim();
  return `${cleaned === '' ? FALLBACK_FILE_NAME : cleaned}${ZIP_EXTENSION}`;
};

export const downloadFailureOfStatus = (status: number): DownloadFailure =>
  FAILURE_BY_STATUS[status] ?? 'unexpected';

export const downloadFailureOfError = (error: Error): DownloadFailure =>
  error.name === 'QuotaExceededError' ? 'noSpace' : 'interrupted';

export const saveRouteOf = ({ system, sharesFile }: SaveTraits): SaveRoute =>
  system === 'ios' && sharesFile ? 'share' : 'download';

export const expectedBytesOf = (requested: number, announced: string | null): number => {
  const length = Number(announced);
  return announced !== null && Number.isSafeInteger(length) && length > 0 ? length : requested;
};

export const closesOnDelivery = (kind: SavedMediaKind, route: SaveRoute): boolean =>
  kind === 'original' && route === 'download';
