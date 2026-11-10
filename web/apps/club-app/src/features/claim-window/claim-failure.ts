import { apiFailureOf } from '@furria/api-client';

export type WindowClaimFailure = 'throttled' | 'unreachable' | 'unexpected';

export const windowClaimFailureOf = (error: Error | null): WindowClaimFailure | null => {
  if (error === null) {
    return null;
  }

  switch (apiFailureOf(error)?.kind) {
    case 'throttled':
      return 'throttled';
    case 'unreachable':
    case 'timedOut':
      return 'unreachable';
    default:
      return 'unexpected';
  }
};
