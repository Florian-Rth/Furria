import { apiFailureOf } from '@furria/api-client';
import { SessionPersistenceError } from '@/lib/api/session/session-error';

export type PasskeyFailureKind =
  | 'cancelled'
  | 'dismissed'
  | 'already-on-device'
  | 'rejected'
  | 'refused'
  | 'throttled'
  | 'unreachable'
  | 'timed-out'
  | 'session-not-kept'
  | 'unexpected';

const CANCELLATION_NAME = 'AbortError';
const DISMISSAL_NAME = 'NotAllowedError';
const ALREADY_REGISTERED_NAME = 'InvalidStateError';

const isDomException = (error: Error): error is DOMException => error instanceof DOMException;

export const toPasskeyFailureKind = (error: Error): PasskeyFailureKind => {
  if (isDomException(error) && error.name === CANCELLATION_NAME) {
    return 'cancelled';
  }
  if (isDomException(error) && error.name === DISMISSAL_NAME) {
    return 'dismissed';
  }
  if (isDomException(error) && error.name === ALREADY_REGISTERED_NAME) {
    return 'already-on-device';
  }

  if (error instanceof SessionPersistenceError) {
    return 'session-not-kept';
  }

  switch (apiFailureOf(error)?.kind) {
    case 'unauthorized':
      return 'rejected';
    case 'refused':
      return 'refused';
    case 'throttled':
      return 'throttled';
    case 'unreachable':
      return 'unreachable';
    case 'timedOut':
      return 'timed-out';
    default:
      return 'unexpected';
  }
};
