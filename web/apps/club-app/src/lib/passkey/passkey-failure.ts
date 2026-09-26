import { RequestBlockedError, RequestFailedError, UnauthorizedError } from '@/lib/api/api-error';

export type PasskeyFailureKind =
  | 'cancelled'
  | 'already-on-device'
  | 'rejected'
  | 'refused'
  | 'unreachable'
  | 'unexpected';

const CANCELLATION_NAMES: readonly string[] = ['NotAllowedError', 'AbortError'];
const ALREADY_REGISTERED_NAME = 'InvalidStateError';

const isDomException = (error: Error): error is DOMException => error instanceof DOMException;

export const toPasskeyFailureKind = (error: Error): PasskeyFailureKind => {
  if (isDomException(error) && CANCELLATION_NAMES.includes(error.name)) {
    return 'cancelled';
  }
  if (isDomException(error) && error.name === ALREADY_REGISTERED_NAME) {
    return 'already-on-device';
  }
  if (error instanceof UnauthorizedError) {
    return 'rejected';
  }
  if (error instanceof RequestFailedError) {
    return 'refused';
  }
  if (error instanceof RequestBlockedError) {
    return 'unreachable';
  }
  return 'unexpected';
};
