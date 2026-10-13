import { apiFailureOf } from '@furria/api-client';

export type LoginErrorKind =
  | 'invalid-credentials'
  | 'throttled'
  | 'unreachable'
  | 'timed-out'
  | 'unexpected';

export const toLoginErrorKind = (error: Error | null): LoginErrorKind | null => {
  if (error === null) {
    return null;
  }

  switch (apiFailureOf(error)?.kind) {
    case 'unauthorized':
      return 'invalid-credentials';
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
