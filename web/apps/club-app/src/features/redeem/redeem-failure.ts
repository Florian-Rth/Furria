import type { Refusal } from '@furria/api-client';
import { apiFailureOf } from '@furria/api-client';
import { SessionPersistenceError } from '@/lib/api/session/session-error';
import type { PasskeyFailureKind } from '@/lib/passkey/passkey-failure';
import { toPasskeyFailureKind } from '@/lib/passkey/passkey-failure';

export type RedeemFailureKind =
  | 'dead'
  | 'taken'
  | 'codeRejected'
  | 'claimRejected'
  | 'claimPasskeyRejected'
  | 'passkeyCancelled'
  | 'passkeyDismissed'
  | 'sessionLost'
  | 'throttled'
  | 'rejected'
  | 'unreachable'
  | 'timedOut'
  | 'unexpected';

const CONFLICT_STATUS = 409;
const LOGIN_EMAIL_FIELD = 'loginEmail';
const CONFIRMATION_CODE_FIELD = 'confirmationCode';
const CLAIM_PASSWORD_FIELD = 'claimPassword';
const CLAIM_PASSKEY_FIELD = 'claimPasskey';

const PASSKEY_FAILURES: Partial<Record<PasskeyFailureKind, RedeemFailureKind>> = {
  cancelled: 'passkeyCancelled',
  dismissed: 'passkeyDismissed',
};

const refusesField = (refusal: Refusal, field: string): boolean =>
  refusal.fields.some((failure) => failure.field === field);

const toRefusalKind = (refusal: Refusal): RedeemFailureKind => {
  if (refusesField(refusal, LOGIN_EMAIL_FIELD)) {
    return 'taken';
  }
  if (refusesField(refusal, CONFIRMATION_CODE_FIELD)) {
    return 'codeRejected';
  }
  if (refusesField(refusal, CLAIM_PASSWORD_FIELD)) {
    return 'claimRejected';
  }
  if (refusesField(refusal, CLAIM_PASSKEY_FIELD)) {
    return 'claimPasskeyRejected';
  }

  return refusal.status === CONFLICT_STATUS ? 'dead' : 'rejected';
};

export const toRedeemFailureKind = (error: Error | null): RedeemFailureKind | null => {
  if (error === null) {
    return null;
  }
  if (error instanceof SessionPersistenceError) {
    return 'sessionLost';
  }
  if (error instanceof DOMException) {
    return PASSKEY_FAILURES[toPasskeyFailureKind(error)] ?? 'claimPasskeyRejected';
  }

  const failure = apiFailureOf(error);

  switch (failure?.kind) {
    case 'unreachable':
      return 'unreachable';
    case 'timedOut':
      return 'timedOut';
    case 'refused':
      return toRefusalKind(failure);
    case 'throttled':
      return 'throttled';
    case 'status':
      return failure.status === CONFLICT_STATUS ? 'dead' : 'unexpected';
    default:
      return 'unexpected';
  }
};
