import { Upload } from 'tus-js-client';
import { apiUrlOf } from '@/lib/api/api-fetch';
import type { UploadTransport } from './media-upload';
import {
  failureStatusOf,
  isSameMetadata,
  TUS_CHUNK_BYTES,
  TUS_RETRY_DELAYS_MS,
} from './tus-options';

export interface TokenUploads {
  path: string;
  header: string;
}

export const tokenTusTransport =
  ({ path, header }: TokenUploads, token: string): UploadTransport =>
  (file, metadata, events) => {
    let isStopped = false;
    const upload = new Upload(file, {
      endpoint: apiUrlOf(path),
      chunkSize: TUS_CHUNK_BYTES,
      retryDelays: TUS_RETRY_DELAYS_MS,
      metadata,
      headers: { [header]: token },
      removeFingerprintOnSuccess: true,
      onProgress: events.onProgress,
      onSuccess: () => {
        events.onSuccess(null);
      },
      onError: (error) => {
        events.onError(failureStatusOf(error));
      },
    });
    void upload
      .findPreviousUploads()
      .then((previous) => {
        const resumable = previous.find((candidate) =>
          isSameMetadata(candidate.metadata, metadata),
        );
        if (resumable !== undefined) {
          upload.resumeFromPreviousUpload(resumable);
        }
        if (!isStopped) {
          upload.start();
        }
      })
      .catch(() => {
        events.onError(null);
      });

    return {
      stop: (discard) => {
        isStopped = true;
        void upload.abort(discard);
      },
    };
  };
