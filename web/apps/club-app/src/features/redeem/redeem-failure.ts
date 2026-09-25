import { RequestBlockedError, RequestFailedError, ServerFailureError } from '@/lib/api/api-error';

export type RedeemFailureKind = 'dead' | 'throttled' | 'rejected' | 'unreachable' | 'unexpected';

const CONFLICT_STATUS = 409;
const TOO_MANY_REQUESTS_STATUS = 429;

export const toRedeemFailureKind = (error: Error | null): RedeemFailureKind | null => {
  if (error === null) {
    return null;
  }
  if (error instanceof RequestBlockedError) {
    return 'unreachable';
  }
  if (error instanceof RequestFailedError) {
    return error.status === CONFLICT_STATUS ? 'dead' : 'rejected';
  }
  if (error instanceof ServerFailureError && error.status === CONFLICT_STATUS) {
    return 'dead';
  }
  if (error instanceof ServerFailureError && error.status === TOO_MANY_REQUESTS_STATUS) {
    return 'throttled';
  }

  return 'unexpected';
};
