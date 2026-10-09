import { DetailedError, Upload } from 'tus-js-client';
import { buildApiUrl } from '@/lib/api/api-fetch';
import { ensureFreshAccessToken } from '@/lib/api/session/session-store';
import { queryClient } from '@/lib/query-client';
import { readApiBaseUrl } from '@/lib/runtime-config';
import { refreshGallery } from '../api';
import { captureTimeOf, localStampOf } from './exif-capture';
import type { ThroughputSample, UploadEntry, UploadFailure } from './upload-queue';
import {
  bytesPerSecondOf,
  failureOfStatus,
  isPreviewable,
  keptSamples,
  nextToStart,
  tallyOf,
  UPLOAD_STREAMS,
  verdictOfFile,
} from './upload-queue';

export interface UploadSnapshot {
  entries: readonly UploadEntry[];
  paused: boolean;
  bytesPerSecond: number;
}

const UPLOADS_PATH = '/api/media/uploads';
const MEDIA_ITEM_HEADER = 'Media-Item-Id';
const CHUNK_BYTES = 16 * 1024 * 1024;
const RETRY_DELAYS_MS = [0, 1_000, 3_000, 5_000, 10_000];
const EXIF_PROBE_BYTES = 256 * 1024;
const PREVIEW_EDGE = 320;
const PREVIEW_QUALITY = 0.72;
const PREVIEW_STREAMS = 2;
const NOTIFY_MS = 160;
const REFRESH_MS = 3_000;

interface Live {
  file: File;
  upload: Upload | null;
}

const live = new Map<number, Live>();
const listeners = new Set<() => void>();
const previewQueue: number[] = [];
let previewsRunning = 0;
let nextKey = 1;
let samples: ThroughputSample[] = [];
let notifyTimer: number | null = null;
let refreshTimer: number | null = null;
let watching = false;
let snapshot: UploadSnapshot = { entries: [], paused: false, bytesPerSecond: 0 };

const publish = (): void => {
  notifyTimer = null;
  const tally = tallyOf(snapshot.entries);
  samples = keptSamples(samples, { at: performance.now(), bytes: tally.bytesSent });
  snapshot = { ...snapshot, bytesPerSecond: bytesPerSecondOf(samples) };
  for (const listener of listeners) {
    listener();
  }
};

const notify = (): void => {
  if (notifyTimer === null) {
    notifyTimer = window.setTimeout(publish, NOTIFY_MS);
  }
};

const refreshSoon = (): void => {
  if (refreshTimer !== null) {
    return;
  }
  refreshTimer = window.setTimeout(() => {
    refreshTimer = null;
    void refreshGallery(queryClient);
  }, REFRESH_MS);
};

const patch = (key: number, change: Partial<UploadEntry>): void => {
  snapshot = {
    ...snapshot,
    entries: snapshot.entries.map((entry) => (entry.key === key ? { ...entry, ...change } : entry)),
  };
  notify();
};

const entryOf = (key: number): UploadEntry | undefined =>
  snapshot.entries.find((entry) => entry.key === key);

const statusOf = (error: Error): number | null =>
  error instanceof DetailedError ? (error.originalResponse?.getStatus() ?? null) : null;

const metadataOf = (file: File, albumId: number | null): Record<string, string> =>
  albumId === null
    ? { owner: 'gallery', filename: file.name }
    : { owner: 'gallery', filename: file.name, album: String(albumId) };

const pump = (): void => {
  if (snapshot.paused) {
    return;
  }
  for (const key of nextToStart(snapshot.entries, UPLOAD_STREAMS)) {
    start(key);
  }
};

const fail = (key: number, failure: UploadFailure): void => {
  const held = live.get(key);
  if (held !== undefined) {
    held.upload = null;
  }
  patch(key, { phase: 'failed', failure });
  pump();
};

const start = (key: number): void => {
  const held = live.get(key);
  const entry = entryOf(key);
  if (held === undefined || entry === undefined) {
    return;
  }
  const upload = new Upload(held.file, {
    endpoint: buildApiUrl(readApiBaseUrl(), UPLOADS_PATH),
    chunkSize: CHUNK_BYTES,
    retryDelays: RETRY_DELAYS_MS,
    metadata: metadataOf(held.file, entry.albumId),
    removeFingerprintOnSuccess: true,
    onBeforeRequest: async (request) => {
      request.setHeader('Authorization', `Bearer ${await ensureFreshAccessToken()}`);
    },
    onAfterResponse: (_request, response) => {
      const mediaItemId = Number(response.getHeader(MEDIA_ITEM_HEADER));
      if (Number.isInteger(mediaItemId) && mediaItemId > 0) {
        patch(key, { mediaItemId });
      }
    },
    onProgress: (sent) => {
      patch(key, { sent });
    },
    onSuccess: () => {
      held.upload = null;
      patch(key, { phase: 'sent', sent: held.file.size, failure: null });
      refreshSoon();
      pump();
    },
    onError: (error) => {
      fail(key, failureOfStatus(statusOf(error)));
    },
  });
  held.upload = upload;
  patch(key, { phase: 'uploading', failure: null });
  void upload
    .findPreviousUploads()
    .then((previous) => {
      const resumable = previous[0];
      if (resumable !== undefined) {
        upload.resumeFromPreviousUpload(resumable);
      }
      if (held.upload === upload) {
        upload.start();
      }
    })
    .catch(() => {
      fail(key, 'interrupted');
    });
};

const isBusy = (): boolean => tallyOf(snapshot.entries).active > 0;

const holdTabOpen = (event: BeforeUnloadEvent): void => {
  if (isBusy()) {
    event.preventDefault();
  }
};

const pause = (): void => {
  snapshot = { ...snapshot, paused: true };
  for (const [key, held] of live) {
    if (held.upload !== null) {
      void held.upload.abort(false);
      held.upload = null;
      patch(key, { phase: 'queued' });
    }
  }
  notify();
};

const resume = (): void => {
  snapshot = { ...snapshot, paused: false };
  notify();
  pump();
};

const watchConnection = (): void => {
  if (watching) {
    return;
  }
  watching = true;
  window.addEventListener('offline', pause);
  window.addEventListener('online', resume);
  window.addEventListener('beforeunload', holdTabOpen);
  if (!navigator.onLine) {
    snapshot = { ...snapshot, paused: true };
  }
};

const renderPreview = async (file: File): Promise<string> => {
  const bitmap = await createImageBitmap(file, {
    resizeWidth: PREVIEW_EDGE,
    resizeQuality: 'medium',
    imageOrientation: 'from-image',
  });
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: PREVIEW_QUALITY });
  return URL.createObjectURL(blob);
};

const developPreviews = (): void => {
  while (previewsRunning < PREVIEW_STREAMS && previewQueue.length > 0) {
    const key = previewQueue.shift();
    const held = key === undefined ? undefined : live.get(key);
    if (key === undefined || held === undefined) {
      continue;
    }
    previewsRunning += 1;
    void renderPreview(held.file)
      .then((preview) => {
        if (live.has(key)) {
          patch(key, { preview });
        } else {
          URL.revokeObjectURL(preview);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        previewsRunning -= 1;
        developPreviews();
      });
  }
};

const readCaptureTime = async (key: number, file: File): Promise<void> => {
  const capturedAt = captureTimeOf(await file.slice(0, EXIF_PROBE_BYTES).arrayBuffer());
  if (capturedAt !== null) {
    patch(key, { capturedAt });
  }
};

const entryFor = (file: File, albumId: number | null): UploadEntry => {
  const verdict = verdictOfFile(file.name, file.type, file.size);
  const key = nextKey;
  nextKey += 1;
  return {
    key,
    name: file.name,
    size: file.size,
    kind: 'kind' in verdict ? verdict.kind : null,
    capturedAt: localStampOf(file.lastModified),
    preview: undefined,
    phase: 'kind' in verdict ? 'queued' : 'refused',
    sent: 0,
    failure: 'refused' in verdict ? verdict.refused : null,
    mediaItemId: null,
    albumId,
  };
};

export const enqueueUploads = (files: readonly File[], albumId: number | null): void => {
  if (files.length === 0) {
    return;
  }
  watchConnection();
  const added = files.map((file) => entryFor(file, albumId));
  added.forEach((entry, index) => {
    const file = files[index];
    if (file === undefined || entry.phase === 'refused') {
      return;
    }
    live.set(entry.key, { file, upload: null });
    if (entry.kind === 'photo') {
      void readCaptureTime(entry.key, file).catch(() => undefined);
    }
    if (isPreviewable(file.name)) {
      previewQueue.push(entry.key);
    }
  });
  snapshot = { ...snapshot, entries: [...snapshot.entries, ...added] };
  notify();
  developPreviews();
  pump();
};

export const retryUpload = (key: number): void => {
  const entry = entryOf(key);
  if (entry?.phase !== 'failed' || !live.has(key)) {
    return;
  }
  patch(key, { phase: 'queued', failure: null, sent: 0 });
  pump();
};

export const retryFailedUploads = (): void => {
  for (const entry of snapshot.entries) {
    if (entry.phase === 'failed' && live.has(entry.key)) {
      patch(entry.key, { phase: 'queued', failure: null, sent: 0 });
    }
  }
  pump();
};

const release = (entry: UploadEntry): void => {
  const held = live.get(entry.key);
  if (held?.upload !== null && held?.upload !== undefined) {
    void held.upload.abort(true);
  }
  live.delete(entry.key);
  if (entry.preview !== undefined) {
    URL.revokeObjectURL(entry.preview);
  }
};

export const cancelOpenUploads = (): void => {
  const open = snapshot.entries.filter((entry) => entry.phase !== 'sent');
  for (const entry of open) {
    release(entry);
  }
  snapshot = { ...snapshot, entries: snapshot.entries.filter((entry) => entry.phase === 'sent') };
  notify();
};

export const clearFinishedUploads = (): void => {
  const finished = snapshot.entries.filter(
    (entry) => entry.phase === 'sent' || entry.phase === 'refused',
  );
  for (const entry of finished) {
    release(entry);
  }
  snapshot = {
    ...snapshot,
    entries: snapshot.entries.filter(
      (entry) => entry.phase !== 'sent' && entry.phase !== 'refused',
    ),
  };
  notify();
};

export const subscribeToUploads = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const readUploads = (): UploadSnapshot => snapshot;
