import { Upload } from 'tus-js-client';
import { apiUrlOf } from '@/lib/api/api-fetch';
import type { UploadTransport } from './media-upload';
import {
  failureStatusOf,
  isSameMetadata,
  TUS_CHUNK_BYTES,
  TUS_RETRY_DELAYS_MS,
} from './tus-options';

const LINK_UPLOADS_PATH = '/api/media/link-uploads';
const TOKEN_HEADER = 'Upload-Link-Token';

export const linkTusTransport =
  (token: string): UploadTransport =>
  (file, metadata, events) => {
    let isStopped = false;
    const upload = new Upload(file, {
      endpoint: apiUrlOf(LINK_UPLOADS_PATH),
      chunkSize: TUS_CHUNK_BYTES,
      retryDelays: TUS_RETRY_DELAYS_MS,
      metadata,
      headers: { [TOKEN_HEADER]: token },
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
