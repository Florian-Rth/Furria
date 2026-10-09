import type { Refusal } from '@furria/api-client';
import { apiFailureOf } from '@furria/api-client';

export type ResetFailureKind = 'dead' | 'password' | 'throttled' | 'unreachable' | 'unexpected';

const PASSWORD_FIELD = 'password';

const refusesPassword = (refusal: Refusal): boolean =>
  refusal.fields.some((failure) => failure.field === PASSWORD_FIELD);

export const toResetFailureKind = (error: Error | null): ResetFailureKind | null => {
  if (error === null) {
    return null;
  }

  const failure = apiFailureOf(error);

  switch (failure?.kind) {
    case 'unreachable':
      return 'unreachable';
    case 'refused':
      return refusesPassword(failure) ? 'password' : 'dead';
    case 'throttled':
      return 'throttled';
    default:
      return 'unexpected';
  }
};
