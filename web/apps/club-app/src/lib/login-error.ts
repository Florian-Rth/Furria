import { RequestBlockedError, ServerFailureError, UnauthorizedError } from '@/lib/api/api-error';

export type LoginErrorKind = 'invalid-credentials' | 'throttled' | 'unreachable' | 'unexpected';

const TOO_MANY_REQUESTS_STATUS = 429;

export const toLoginErrorKind = (error: Error | null): LoginErrorKind | null => {
  if (error === null) {
    return null;
  }
  if (error instanceof UnauthorizedError) {
    return 'invalid-credentials';
  }
  if (error instanceof ServerFailureError && error.status === TOO_MANY_REQUESTS_STATUS) {
    return 'throttled';
  }
  if (error instanceof RequestBlockedError) {
    return 'unreachable';
  }
  return 'unexpected';
};
