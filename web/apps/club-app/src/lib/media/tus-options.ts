import { transferStatusOf } from '@furria/api-client/upload-failure';
import { DetailedError } from 'tus-js-client';

export const TUS_CHUNK_BYTES = 16 * 1024 * 1024;
export const TUS_RETRY_DELAYS_MS = [0, 1_000, 3_000, 5_000, 10_000];

export const failureStatusOf = (error: Error): number | null =>
  error instanceof DetailedError
    ? transferStatusOf(
        error.originalResponse?.getStatus() ?? null,
        error.originalRequest?.getMethod() ?? null,
      )
    : null;

export const isSameMetadata = (
  left: Record<string, string>,
  right: Record<string, string>,
): boolean =>
  Object.keys(left).length === Object.keys(right).length &&
  Object.entries(left).every(([key, value]) => right[key] === value);
