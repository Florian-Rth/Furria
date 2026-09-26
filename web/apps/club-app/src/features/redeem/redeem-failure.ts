import { RequestBlockedError, RequestFailedError, ServerFailureError } from '@/lib/api/api-error';
import { toCamelCaseField } from '@/lib/api/api-failures';
import { toPasskeyFailureKind } from '@/lib/passkey/passkey-failure';

export type RedeemFailureKind =
  | 'dead'
  | 'taken'
  | 'codeRejected'
  | 'claimRejected'
  | 'claimPasskeyRejected'
  | 'passkeyCancelled'
  | 'throttled'
  | 'rejected'
  | 'unreachable'
  | 'unexpected';

const CONFLICT_STATUS = 409;
const TOO_MANY_REQUESTS_STATUS = 429;
const LOGIN_EMAIL_FIELD = 'loginEmail';
const CONFIRMATION_CODE_FIELD = 'confirmationCode';
const CLAIM_PASSWORD_FIELD = 'claimPassword';
const CLAIM_PASSKEY_FIELD = 'claimPasskey';

const refusesField = (error: RequestFailedError, field: string): boolean =>
  error.failures.some((failure) => toCamelCaseField(failure.field) === field);

const toRefusalKind = (error: RequestFailedError): RedeemFailureKind => {
  if (refusesField(error, LOGIN_EMAIL_FIELD)) {
    return 'taken';
  }
  if (refusesField(error, CONFIRMATION_CODE_FIELD)) {
    return 'codeRejected';
  }
  if (refusesField(error, CLAIM_PASSWORD_FIELD)) {
    return 'claimRejected';
  }
  if (refusesField(error, CLAIM_PASSKEY_FIELD)) {
    return 'claimPasskeyRejected';
  }

  return error.status === CONFLICT_STATUS ? 'dead' : 'rejected';
};

export const toRedeemFailureKind = (error: Error | null): RedeemFailureKind | null => {
  if (error === null) {
    return null;
  }
  if (error instanceof DOMException) {
    return toPasskeyFailureKind(error) === 'cancelled'
      ? 'passkeyCancelled'
      : 'claimPasskeyRejected';
  }
  if (error instanceof RequestBlockedError) {
    return 'unreachable';
  }
  if (error instanceof RequestFailedError) {
    return toRefusalKind(error);
  }
  if (error instanceof ServerFailureError && error.status === CONFLICT_STATUS) {
    return 'dead';
  }
  if (error instanceof ServerFailureError && error.status === TOO_MANY_REQUESTS_STATUS) {
    return 'throttled';
  }

  return 'unexpected';
};
