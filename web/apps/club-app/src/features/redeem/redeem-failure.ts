import { RequestBlockedError, RequestFailedError, ServerFailureError } from '@/lib/api/api-error';
import { toCamelCaseField } from '@/lib/api/api-failures';

export type RedeemFailureKind =
  | 'dead'
  | 'taken'
  | 'codeRejected'
  | 'throttled'
  | 'rejected'
  | 'unreachable'
  | 'unexpected';

const CONFLICT_STATUS = 409;
const TOO_MANY_REQUESTS_STATUS = 429;
const LOGIN_EMAIL_FIELD = 'loginEmail';
const CONFIRMATION_CODE_FIELD = 'confirmationCode';

const refusesField = (error: RequestFailedError, field: string): boolean =>
  error.failures.some((failure) => toCamelCaseField(failure.field) === field);

const toRefusalKind = (error: RequestFailedError): RedeemFailureKind => {
  if (refusesField(error, LOGIN_EMAIL_FIELD)) {
    return 'taken';
  }
  if (refusesField(error, CONFIRMATION_CODE_FIELD)) {
    return 'codeRejected';
  }

  return error.status === CONFLICT_STATUS ? 'dead' : 'rejected';
};

export const toRedeemFailureKind = (error: Error | null): RedeemFailureKind | null => {
  if (error === null) {
    return null;
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
