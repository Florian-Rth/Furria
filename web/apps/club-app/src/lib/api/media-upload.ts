import { isUnauthorizedStatus } from '@furria/api-client';
import type { HttpRequest, HttpResponse } from 'tus-js-client';
import { DetailedError, defaultOptions } from 'tus-js-client';
import { apiUrlOf } from './api-fetch';
import { ensureFreshAccessToken, expireSession } from './session/session-store';

const MEDIA_UPLOADS_PATH = '/api/media/uploads';

export const mediaUploadEndpoint = (): string => apiUrlOf(MEDIA_UPLOADS_PATH);

export const authorizeUploadRequest = async (request: HttpRequest): Promise<void> => {
  request.setHeader('Authorization', `Bearer ${await ensureFreshAccessToken()}`);
};

export const endSessionOnRejectedUpload = (response: HttpResponse): void => {
  if (isUnauthorizedStatus(response.getStatus())) {
    expireSession();
  }
};

export const uploadStatusOf = (error: Error): number | null =>
  error instanceof DetailedError ? (error.originalResponse?.getStatus() ?? null) : null;

export const forgetResumableUploads = async (): Promise<void> => {
  const storage = defaultOptions.urlStorage;

  for (const previous of await storage.findAllUploads()) {
    await storage.removeUpload(previous.urlStorageKey);
  }
};
