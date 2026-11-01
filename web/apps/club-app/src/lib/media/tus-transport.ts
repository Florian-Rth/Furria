import { isUnauthorizedStatus } from '@furria/api-client';
import { defaultOptions, Upload } from 'tus-js-client';
import { apiUrlOf } from '@/lib/api/api-fetch';
import { ensureFreshAccessToken, expireSession } from '@/lib/api/session/session-store';
import type { UploadTransport } from './media-upload';
import {
  failureStatusOf,
  isSameMetadata,
  TUS_CHUNK_BYTES,
  TUS_RETRY_DELAYS_MS,
} from './tus-options';

const UPLOADS_PATH = '/api/media/uploads';
const MEDIA_ITEM_HEADER = 'Media-Item-Id';

export const tusTransport: UploadTransport = (file, metadata, events) => {
  let mediaItemId: number | null = null;
  let isStopped = false;
  const upload = new Upload(file, {
    endpoint: apiUrlOf(UPLOADS_PATH),
    chunkSize: TUS_CHUNK_BYTES,
    retryDelays: TUS_RETRY_DELAYS_MS,
    metadata,
    removeFingerprintOnSuccess: true,
    onBeforeRequest: async (request) => {
      request.setHeader('Authorization', `Bearer ${await ensureFreshAccessToken()}`);
    },
    onAfterResponse: (_request, response) => {
      if (isUnauthorizedStatus(response.getStatus())) {
        expireSession();
      }
      const announced = Number(response.getHeader(MEDIA_ITEM_HEADER));
      if (Number.isInteger(announced) && announced > 0) {
        mediaItemId = announced;
      }
    },
    onProgress: events.onProgress,
    onSuccess: () => {
      events.onSuccess(mediaItemId);
    },
    onError: (error) => {
      events.onError(failureStatusOf(error));
    },
  });
  void upload
    .findPreviousUploads()
    .then((previous) => {
      const resumable = previous.find((candidate) => isSameMetadata(candidate.metadata, metadata));
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

export const forgetResumableUploads = async (): Promise<void> => {
  const storage = defaultOptions.urlStorage;

  for (const previous of await storage.findAllUploads()) {
    await storage.removeUpload(previous.urlStorageKey);
  }
};
