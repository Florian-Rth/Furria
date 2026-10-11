import { DetailedError, Upload } from 'tus-js-client';
import { buildApiUrl } from '@/lib/api/api-fetch';
import { ensureFreshAccessToken } from '@/lib/api/session/session-store';
import { readApiBaseUrl } from '@/lib/runtime-config';
import type { UploadTransport } from './media-upload';

const UPLOADS_PATH = '/api/media/uploads';
const MEDIA_ITEM_HEADER = 'Media-Item-Id';
const CHUNK_BYTES = 16 * 1024 * 1024;
const RETRY_DELAYS_MS = [0, 1_000, 3_000, 5_000, 10_000];

const statusOf = (error: Error): number | null =>
  error instanceof DetailedError ? (error.originalResponse?.getStatus() ?? null) : null;

const isSameMetadata = (left: Record<string, string>, right: Record<string, string>): boolean =>
  Object.keys(left).length === Object.keys(right).length &&
  Object.entries(left).every(([key, value]) => right[key] === value);

export const tusTransport: UploadTransport = (file, metadata, events) => {
  let mediaItemId: number | null = null;
  let isStopped = false;
  const upload = new Upload(file, {
    endpoint: buildApiUrl(readApiBaseUrl(), UPLOADS_PATH),
    chunkSize: CHUNK_BYTES,
    retryDelays: RETRY_DELAYS_MS,
    metadata,
    removeFingerprintOnSuccess: true,
    onBeforeRequest: async (request) => {
      request.setHeader('Authorization', `Bearer ${await ensureFreshAccessToken()}`);
    },
    onAfterResponse: (_request, response) => {
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
      events.onError(statusOf(error));
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
