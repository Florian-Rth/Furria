import type { KkCrop } from '@furria/ui';
import { Upload } from 'tus-js-client';
import {
  authorizeUploadRequest,
  endSessionOnRejectedUpload,
  mediaUploadEndpoint,
  uploadStatusOf,
} from '@/lib/api/media-upload';
import { subscribeToSessionEnd } from '@/lib/api/session/session-store';
import type { PictureTarget, PictureUploadFailure } from './picture-target';
import { toUploadFailure, toUploadMetadata } from './picture-target';

const CHUNK_BYTES = 16 * 1024 * 1024;
const RETRY_DELAYS_MS = [0, 1_000, 3_000, 5_000];

export class PictureUploadError extends Error {
  readonly failure: PictureUploadFailure;

  constructor(failure: PictureUploadFailure) {
    super(failure);
    this.failure = failure;
  }
}

interface PictureUpload {
  file: File;
  target: PictureTarget;
  crop: KkCrop | null;
  onProgress: (share: number) => void;
}

export const uploadPicture = ({ file, target, crop, onProgress }: PictureUpload): Promise<void> =>
  new Promise((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: mediaUploadEndpoint(),
      chunkSize: CHUNK_BYTES,
      retryDelays: RETRY_DELAYS_MS,
      metadata: toUploadMetadata(target, file.name, crop),
      removeFingerprintOnSuccess: true,
      onBeforeRequest: authorizeUploadRequest,
      onAfterResponse: (_request, response) => {
        endSessionOnRejectedUpload(response);
      },
      onProgress: (sent, total) => {
        onProgress(total === 0 ? 0 : sent / total);
      },
      onSuccess: () => {
        stopWatchingTheSession();
        resolve();
      },
      onError: (error) => {
        stopWatchingTheSession();
        reject(new PictureUploadError(toUploadFailure(uploadStatusOf(error))));
      },
    });
    const stopWatchingTheSession = subscribeToSessionEnd(() => {
      stopWatchingTheSession();
      void upload.abort(false);
      reject(new PictureUploadError('interrupted'));
    });
    upload.start();
  });
