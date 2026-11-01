import { subscribeToSessionEnd } from '@/lib/api/session/session-store';
import { startUpload } from '@/lib/media/start-upload';
import { refreshAfter } from '@/lib/query/refresh-after';
import { queryClient } from '@/lib/query-client';
import type { UploadSnapshot } from './create-upload-store';
import { createUploadStore } from './create-upload-store';

export type { UploadSnapshot } from './create-upload-store';

const REFRESH_MS = 3_000;

let refreshTimer: number | null = null;

const refreshSoon = (): void => {
  if (refreshTimer !== null) {
    return;
  }
  refreshTimer = window.setTimeout(() => {
    refreshTimer = null;
    void refreshAfter(queryClient, ['media']);
  }, REFRESH_MS);
};

const galleryUploads = createUploadStore({
  start: (file, entry) => startUpload({ file, owner: { kind: 'gallery', albumId: entry.albumId } }),
  onSent: refreshSoon,
});

subscribeToSessionEnd(galleryUploads.discard);

export const enqueueUploads = galleryUploads.enqueue;
export const retryUpload = galleryUploads.retry;
export const retryFailedUploads = galleryUploads.retryFailed;
export const cancelOpenUploads = galleryUploads.cancelOpen;
export const clearFinishedUploads = galleryUploads.clearFinished;
export const subscribeToUploads = galleryUploads.subscribe;
export const readUploads = (): UploadSnapshot => galleryUploads.read();
