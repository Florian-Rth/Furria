import { RequestBlockedError, ServerFailureError, UnauthorizedError } from './api-error';

export const MAX_RETRY_ATTEMPTS = 1;

const SERVER_FAILURE_FLOOR = 500;

const isTransient = (error: Error): boolean => {
  if (error instanceof UnauthorizedError) {
    return false;
  }
  if (error instanceof RequestBlockedError) {
    return true;
  }
  if (error instanceof ServerFailureError) {
    return error.status >= SERVER_FAILURE_FLOOR;
  }
  return false;
};

export const shouldRetryRequest = (failureCount: number, error: Error): boolean =>
  failureCount < MAX_RETRY_ATTEMPTS && isTransient(error);
