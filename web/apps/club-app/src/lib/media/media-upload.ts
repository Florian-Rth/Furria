import type { KkCrop } from '@furria/ui';
import type { UploadFailure } from './upload-failure';
import { failureOfStatus } from './upload-failure';

export type UploadOwner =
  | { kind: 'person' | 'group' | 'news'; id: number }
  | { kind: 'gallery'; albumId: number | null };

export interface MediaUpload {
  file: File;
  owner: UploadOwner;
  crop?: KkCrop | null;
}

export interface UploadProgress {
  sent: number;
  total: number;
  share: number;
}

export type UploadOutcome =
  | { kind: 'sent'; mediaItemId: number | null }
  | { kind: 'failed'; failure: UploadFailure }
  | { kind: 'stopped' };

export interface UploadHandle {
  progress: (listener: (progress: UploadProgress) => void) => () => void;
  cancel: () => void;
  pause: () => void;
  done: Promise<UploadOutcome>;
}

export interface TransportEvents {
  onProgress: (sent: number, total: number) => void;
  onSuccess: (mediaItemId: number | null) => void;
  onError: (status: number | null) => void;
}

export interface TransportRun {
  stop: (discard: boolean) => void;
}

export type UploadTransport = (
  file: File,
  metadata: Record<string, string>,
  events: TransportEvents,
) => TransportRun;

const ownerTokenOf = (owner: UploadOwner): string =>
  owner.kind === 'gallery' ? 'gallery' : `${owner.kind}:${owner.id}`;

const albumOf = (owner: UploadOwner): Record<string, string> =>
  owner.kind === 'gallery' && owner.albumId !== null ? { album: String(owner.albumId) } : {};

const cropOf = (crop: KkCrop | null | undefined): Record<string, string> =>
  crop === null || crop === undefined
    ? {}
    : { crop: [crop.left, crop.top, crop.width, crop.height].join(',') };

const metadataOf = ({ file, owner, crop }: MediaUpload): Record<string, string> => ({
  owner: ownerTokenOf(owner),
  filename: file.name,
  ...albumOf(owner),
  ...cropOf(crop),
});

export const uploadVia = (transport: UploadTransport, upload: MediaUpload): UploadHandle => {
  const listeners = new Set<(progress: UploadProgress) => void>();
  let settle: (outcome: UploadOutcome) => void = () => undefined;
  let isOpen = true;
  const done = new Promise<UploadOutcome>((resolve) => {
    settle = resolve;
  });
  const finish = (outcome: UploadOutcome): void => {
    if (isOpen) {
      isOpen = false;
      listeners.clear();
      settle(outcome);
    }
  };
  const run = transport(upload.file, metadataOf(upload), {
    onProgress: (sent, total) => {
      const progress = { sent, total, share: total === 0 ? 0 : sent / total };
      for (const listener of listeners) {
        listener(progress);
      }
    },
    onSuccess: (mediaItemId) => {
      finish({ kind: 'sent', mediaItemId });
    },
    onError: (status) => {
      finish({ kind: 'failed', failure: failureOfStatus(status) });
    },
  });
  const stop = (discard: boolean): void => {
    if (isOpen) {
      run.stop(discard);
      finish({ kind: 'stopped' });
    }
  };

  return {
    progress: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    cancel: () => {
      stop(true);
    },
    pause: () => {
      stop(false);
    },
    done,
  };
};
