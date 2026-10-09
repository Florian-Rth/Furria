import type { MediaKind } from '../schemas';

export type UploadPhase = 'queued' | 'uploading' | 'sent' | 'failed' | 'refused';

export type UploadFailure = 'tooLarge' | 'notAccepted' | 'notAllowed' | 'albumGone' | 'interrupted';

export interface UploadEntry {
  key: number;
  name: string;
  size: number;
  kind: MediaKind | null;
  capturedAt: string;
  preview: string | undefined;
  phase: UploadPhase;
  sent: number;
  failure: UploadFailure | null;
  mediaItemId: number | null;
  albumId: number | null;
}

export type FileVerdict = { kind: MediaKind } | { refused: UploadFailure };

export const UPLOAD_STREAMS = 4;
export const UPLOAD_ACCEPT =
  'image/jpeg,image/png,image/webp,image/heic,image/heif,video/mp4,video/quicktime,.heic,.heif,.mov';

const MEGABYTE = 1024 * 1024;
const GIGABYTE = 1024 * MEGABYTE;
const PHOTO_LIMIT = 100 * MEGABYTE;
const VIDEO_LIMIT = 20 * GIGABYTE;
const SECONDS_PER_MINUTE = 60;

const PHOTO_EXTENSIONS: ReadonlySet<string> = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'heic',
  'heif',
]);
const VIDEO_EXTENSIONS: ReadonlySet<string> = new Set(['mp4', 'mov', 'm4v']);
const PREVIEWABLE_EXTENSIONS: ReadonlySet<string> = new Set(['jpg', 'jpeg', 'png', 'webp']);

const FAILURE_BY_STATUS: Record<number, UploadFailure> = {
  403: 'notAllowed',
  404: 'albumGone',
  413: 'tooLarge',
  415: 'notAccepted',
};

const extensionOf = (name: string): string => {
  const dot = name.lastIndexOf('.');
  return dot < 0 ? '' : name.slice(dot + 1).toLowerCase();
};

const VIDEO_TYPES: ReadonlySet<string> = new Set(['video/mp4', 'video/quicktime']);

const kindOf = (name: string, type: string): MediaKind | null => {
  const extension = extensionOf(name);
  if (VIDEO_EXTENSIONS.has(extension) || VIDEO_TYPES.has(type)) {
    return 'video';
  }
  return PHOTO_EXTENSIONS.has(extension) ? 'photo' : null;
};

export const verdictOfFile = (name: string, type: string, size: number): FileVerdict => {
  const kind = kindOf(name, type);
  if (kind === null) {
    return { refused: 'notAccepted' };
  }
  const limit = kind === 'photo' ? PHOTO_LIMIT : VIDEO_LIMIT;
  return size > limit ? { refused: 'tooLarge' } : { kind };
};

export const isPreviewable = (name: string): boolean =>
  PREVIEWABLE_EXTENSIONS.has(extensionOf(name));

export const isHidden = (name: string): boolean => name.startsWith('.');

export const failureOfStatus = (status: number | null): UploadFailure =>
  (status === null ? undefined : FAILURE_BY_STATUS[status]) ?? 'interrupted';

export const isRetryable = (failure: UploadFailure | null): boolean =>
  failure === 'interrupted' || failure === null;

const byTurn = (left: UploadEntry, right: UploadEntry): number => {
  if (left.kind !== right.kind) {
    return left.kind === 'photo' ? -1 : 1;
  }
  return left.capturedAt.localeCompare(right.capturedAt) || left.key - right.key;
};

export const nextToStart = (entries: readonly UploadEntry[], streams: number): number[] => {
  const free = streams - entries.filter((entry) => entry.phase === 'uploading').length;
  if (free <= 0) {
    return [];
  }
  return entries
    .filter((entry) => entry.phase === 'queued')
    .sort(byTurn)
    .slice(0, free)
    .map((entry) => entry.key);
};

export const inCaptureOrder = (entries: readonly UploadEntry[]): UploadEntry[] =>
  [...entries].sort(
    (left, right) => left.capturedAt.localeCompare(right.capturedAt) || left.key - right.key,
  );

export interface UploadTally {
  total: number;
  sent: number;
  active: number;
  streaming: number;
  failed: number;
  refused: number;
  bytesTotal: number;
  bytesSent: number;
}

export const tallyOf = (entries: readonly UploadEntry[]): UploadTally => {
  const tally: UploadTally = {
    total: 0,
    sent: 0,
    active: 0,
    streaming: 0,
    failed: 0,
    refused: 0,
    bytesTotal: 0,
    bytesSent: 0,
  };
  for (const entry of entries) {
    if (entry.phase === 'refused') {
      tally.refused += 1;
      continue;
    }
    tally.total += 1;
    tally.sent += entry.phase === 'sent' ? 1 : 0;
    tally.active += entry.phase === 'queued' || entry.phase === 'uploading' ? 1 : 0;
    tally.streaming += entry.phase === 'uploading' ? 1 : 0;
    tally.failed += entry.phase === 'failed' ? 1 : 0;
    tally.bytesTotal += entry.size;
    tally.bytesSent += entry.phase === 'sent' ? entry.size : entry.sent;
  }
  return tally;
};

export interface ThroughputSample {
  at: number;
  bytes: number;
}

export const THROUGHPUT_WINDOW_MS = 12_000;

export const bytesPerSecondOf = (samples: readonly ThroughputSample[]): number => {
  const first = samples[0];
  const last = samples.at(-1);
  if (first === undefined || last === undefined || last.at <= first.at) {
    return 0;
  }
  return ((last.bytes - first.bytes) / (last.at - first.at)) * 1000;
};

export const keptSamples = (
  samples: readonly ThroughputSample[],
  next: ThroughputSample,
): ThroughputSample[] => [
  ...samples.filter((sample) => next.at - sample.at <= THROUGHPUT_WINDOW_MS),
  next,
];

export const remainingMinutesOf = (bytesLeft: number, bytesPerSecond: number): number | null => {
  if (bytesLeft <= 0) {
    return 0;
  }
  if (bytesPerSecond <= 0) {
    return null;
  }
  return Math.max(Math.ceil(bytesLeft / bytesPerSecond / SECONDS_PER_MINUTE), 1);
};

export const targetsOf = (
  entries: readonly Pick<UploadEntry, 'albumId' | 'phase'>[],
  pageAlbumId: number | null,
): (number | null)[] => [
  ...new Set([
    pageAlbumId,
    ...entries.filter((entry) => entry.phase === 'sent').map((entry) => entry.albumId),
  ]),
];
