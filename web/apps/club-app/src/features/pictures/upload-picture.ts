import type { KkCrop } from '@furria/ui';
import { DetailedError, Upload } from 'tus-js-client';
import { buildApiUrl } from '@/lib/api/api-fetch';
import { ensureFreshAccessToken } from '@/lib/api/session/session-store';
import { readApiBaseUrl } from '@/lib/runtime-config';
import type { PictureTarget, PictureUploadFailure } from './picture-target';
import { toOwnerMetadata, toUploadFailure, toUploadOwner } from './picture-target';

const UPLOADS_PATH = '/api/media/uploads';
const CHUNK_BYTES = 16 * 1024 * 1024;
const RETRY_DELAYS_MS = [0, 1_000, 3_000, 5_000];

export class PictureUploadError extends Error {
  readonly failure: PictureUploadFailure;

  constructor(failure: PictureUploadFailure) {
    super(failure);
    this.failure = failure;
  }
}

const statusOf = (error: Error): number | null =>
  error instanceof DetailedError ? (error.originalResponse?.getStatus() ?? null) : null;

interface PictureUpload {
  file: File;
  target: PictureTarget;
  crop: KkCrop | null;
  onProgress: (share: number) => void;
}

export interface OwnedPictureUpload {
  file: File;
  owner: string;
  crop: KkCrop | null;
  onProgress: (share: number) => void;
  signal?: AbortSignal;
}

export const uploadOwnedPicture = ({
  file,
  owner,
  crop,
  onProgress,
  signal,
}: OwnedPictureUpload): Promise<void> =>
  new Promise((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: buildApiUrl(readApiBaseUrl(), UPLOADS_PATH),
      chunkSize: CHUNK_BYTES,
      retryDelays: RETRY_DELAYS_MS,
      metadata: toOwnerMetadata(owner, file.name, crop),
      removeFingerprintOnSuccess: true,
      onBeforeRequest: async (request) => {
        request.setHeader('Authorization', `Bearer ${await ensureFreshAccessToken()}`);
      },
      onProgress: (sent, total) => {
        onProgress(total === 0 ? 0 : sent / total);
      },
      onSuccess: () => {
        resolve();
      },
      onError: (error) => {
        reject(new PictureUploadError(toUploadFailure(statusOf(error))));
      },
    });
    signal?.addEventListener('abort', () => {
      void upload.abort(true);
      reject(new PictureUploadError('interrupted'));
    });
    upload.start();
  });

export const uploadPicture = ({ file, target, crop, onProgress }: PictureUpload): Promise<void> =>
  uploadOwnedPicture({ file, owner: toUploadOwner(target), crop, onProgress });
