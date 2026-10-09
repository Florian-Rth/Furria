import type { KkFrameState } from '@furria/ui';
import type { MediaItemState } from '@/lib/api/schemas';
import type { UploadEntry } from './upload-queue';

export interface DevelopedItem {
  state: MediaItemState;
  source: string;
}

export interface UploadTileLook {
  state: KkFrameState;
  progress: number;
  source: string | undefined;
  retryable: boolean;
}

const sentLook = (entry: UploadEntry, developed: DevelopedItem | undefined): UploadTileLook => {
  switch (developed?.state) {
    case 'ready':
      return { state: 'ready', progress: 1, source: developed.source, retryable: false };
    case 'failed':
      return { state: 'failed', progress: 1, source: entry.preview, retryable: false };
    default:
      return { state: 'processing', progress: 1, source: entry.preview, retryable: false };
  }
};

export const tileLookOf = (
  entry: UploadEntry,
  developed: DevelopedItem | undefined,
): UploadTileLook => {
  switch (entry.phase) {
    case 'refused':
      return { state: 'failed', progress: 0, source: undefined, retryable: false };
    case 'failed':
      return {
        state: 'failed',
        progress: 0,
        source: entry.preview,
        retryable: entry.failure === 'interrupted',
      };
    case 'queued':
      return { state: 'queued', progress: 0, source: entry.preview, retryable: false };
    case 'uploading':
      return {
        state: 'uploading',
        progress: entry.size === 0 ? 0 : entry.sent / entry.size,
        source: entry.preview,
        retryable: false,
      };
    case 'sent':
      return sentLook(entry, developed);
  }
};

export const isDeveloped = (look: UploadTileLook): boolean => look.state === 'ready';
