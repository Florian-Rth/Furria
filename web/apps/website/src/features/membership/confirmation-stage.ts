import { apiFailureOf } from '@furria/api-client';
import type { ConfirmationOutcome } from './schemas';

export type ConfirmationVerdict = ConfirmationOutcome | 'incomplete';

export type ConfirmationFailure = 'blocked' | 'unavailable';

export type ConfirmationStage =
  | { kind: 'confirming' }
  | { kind: 'failed'; failure: ConfirmationFailure }
  | { kind: 'settled'; verdict: ConfirmationVerdict };

export const resolveConfirmationStage = (
  token: string | null,
  outcome: ConfirmationOutcome | undefined,
  error: Error | null,
  isConfirming: boolean,
): ConfirmationStage => {
  if (token === null) {
    return { kind: 'settled', verdict: 'incomplete' };
  }

  if (outcome !== undefined) {
    return { kind: 'settled', verdict: outcome };
  }

  if (error === null || isConfirming) {
    return { kind: 'confirming' };
  }

  return {
    kind: 'failed',
    failure: apiFailureOf(error)?.kind === 'unreachable' ? 'blocked' : 'unavailable',
  };
};
