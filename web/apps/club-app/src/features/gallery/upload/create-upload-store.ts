import type { UploadHandle, UploadOutcome } from '@/lib/media/media-upload';
import { captureTimeOf, localStampOf } from './exif-capture';
import type { ThroughputSample, UploadEntry } from './upload-queue';
import {
  bytesPerSecondOf,
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

const EXIF_PROBE_BYTES = 256 * 1024;
const PREVIEW_EDGE = 320;
const PREVIEW_QUALITY = 0.72;
const PREVIEW_STREAMS = 2;
const NOTIFY_MS = 160;

interface Live {
  file: File;
  upload: UploadHandle | null;
}

export interface UploadStoreOptions {
  start: (file: File, entry: UploadEntry) => UploadHandle;
  onSent: () => void;
}

export interface UploadStore {
  enqueue: (files: readonly File[], albumId: number | null) => void;
  retry: (key: number) => void;
  retryFailed: () => void;
  cancelOpen: () => void;
  clearFinished: () => void;
  discard: () => void;
  subscribe: (listener: () => void) => () => void;
  read: () => UploadSnapshot;
}

export const createUploadStore = ({ start: startFor, onSent }: UploadStoreOptions): UploadStore => {
  const live = new Map<number, Live>();
  const listeners = new Set<() => void>();
  const previewQueue: number[] = [];
  let previewsRunning = 0;
  let nextKey = 1;
  let samples: ThroughputSample[] = [];
  let notifyTimer: number | null = null;
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

  const patch = (key: number, change: Partial<UploadEntry>): void => {
    snapshot = {
      ...snapshot,
      entries: snapshot.entries.map((entry) =>
        entry.key === key ? { ...entry, ...change } : entry,
      ),
    };
    notify();
  };

  const entryOf = (key: number): UploadEntry | undefined =>
    snapshot.entries.find((entry) => entry.key === key);

  const pump = (): void => {
    if (snapshot.paused) {
      return;
    }
    for (const key of nextToStart(snapshot.entries, UPLOAD_STREAMS)) {
      start(key);
    }
  };

  const settle = (key: number, held: Live, outcome: UploadOutcome): void => {
    switch (outcome.kind) {
      case 'sent':
        patch(key, {
          phase: 'sent',
          sent: held.file.size,
          failure: null,
          mediaItemId: outcome.mediaItemId,
        });
        onSent();
        break;
      case 'failed':
        patch(key, { phase: 'failed', failure: outcome.failure });
        break;
      case 'stopped':
        return;
    }
    pump();
  };

  const start = (key: number): void => {
    const held = live.get(key);
    const entry = entryOf(key);
    if (held === undefined || entry === undefined) {
      return;
    }
    const upload = startFor(held.file, entry);
    held.upload = upload;
    patch(key, { phase: 'uploading', failure: null });
    upload.progress(({ sent }) => {
      patch(key, { sent });
    });
    void upload.done.then((outcome) => {
      if (held.upload === upload) {
        held.upload = null;
        settle(key, held, outcome);
      }
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
        held.upload.pause();
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

  const enqueue = (files: readonly File[], albumId: number | null): void => {
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

  const retry = (key: number): void => {
    const entry = entryOf(key);
    if (entry?.phase !== 'failed' || !live.has(key)) {
      return;
    }
    patch(key, { phase: 'queued', failure: null, sent: 0 });
    pump();
  };

  const retryFailed = (): void => {
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
      held.upload.cancel();
    }
    live.delete(entry.key);
    if (entry.preview !== undefined) {
      URL.revokeObjectURL(entry.preview);
    }
  };

  const cancelOpen = (): void => {
    const open = snapshot.entries.filter((entry) => entry.phase !== 'sent');
    for (const entry of open) {
      release(entry);
    }
    snapshot = { ...snapshot, entries: snapshot.entries.filter((entry) => entry.phase === 'sent') };
    notify();
  };

  const clearFinished = (): void => {
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

  const discard = (): void => {
    for (const [key, held] of live) {
      if (held.upload !== null) {
        held.upload.pause();
      }
      live.delete(key);
    }
    for (const entry of snapshot.entries) {
      if (entry.preview !== undefined) {
        URL.revokeObjectURL(entry.preview);
      }
    }
    previewQueue.length = 0;
    samples = [];
    snapshot = { entries: [], paused: snapshot.paused, bytesPerSecond: 0 };
    notify();
  };

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return {
    enqueue,
    retry,
    retryFailed,
    cancelOpen,
    clearFinished,
    discard,
    subscribe,
    read: () => snapshot,
  };
};
