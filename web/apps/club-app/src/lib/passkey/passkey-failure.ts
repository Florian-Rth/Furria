import { apiFailureOf } from '@furria/api-client';

export type PasskeyFailureKind =
  | 'cancelled'
  | 'already-on-device'
  | 'rejected'
  | 'refused'
  | 'throttled'
  | 'unreachable'
  | 'timed-out'
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
