import { ApiError } from '@/lib/api/errors';

const NOT_FOUND_STATUS = 404;
const MAX_RETRIES = 1;

export const shouldRetryPublicRead = (failureCount: number, error: Error): boolean =>
  !(error instanceof ApiError && error.status === NOT_FOUND_STATUS) && failureCount < MAX_RETRIES;
